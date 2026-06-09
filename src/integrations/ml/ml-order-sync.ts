import { db } from '../../database/db.js';
import { fetchPaidOrdersSince } from './ml-client.js';
import type { MlOrder, MlBuyer, MlSkuMappingRow } from './ml.types.js';

const DEFAULT_INTERVAL_MINUTES = 15;

let interval: NodeJS.Timeout | null = null;
let running = false;

export function startMlOrderSyncJob(intervalMinutes?: number): void {
  if (interval) return;

  const minutes = intervalMinutes ?? readNumberEnv('ML_SYNC_INTERVAL_MINUTES', DEFAULT_INTERVAL_MINUTES);
  const sellerId = readNumberEnv('ML_USER_ID', 0);

  if (!sellerId) {
    console.error('ML order sync: ML_USER_ID não configurado. Job não iniciado.');
    return;
  }

  const ms = minutes * 60 * 1000;

  void runSync(sellerId);

  interval = setInterval(() => {
    void runSync(sellerId);
  }, ms);

  console.log(`ML order sync job started. interval=${minutes}min sellerId=${sellerId}`);
}

export function stopMlOrderSyncJob(): void {
  if (!interval) return;
  clearInterval(interval);
  interval = null;
}

async function runSync(sellerId: number): Promise<void> {
  if (running) {
    console.log('ML order sync skipped: execução anterior ainda em andamento.');
    return;
  }

  running = true;
  try {
    const { imported, skipped, errors } = await syncNewOrders(sellerId);
    console.log(`ML order sync concluído. imported=${imported} skipped=${skipped} errors=${errors}`);
  } catch (error) {
    console.error('ML order sync falhou.', error);
  } finally {
    running = false;
  }
}

async function syncNewOrders(sellerId: number): Promise<{ imported: number; skipped: number; errors: number }> {
  const since = await getLastSyncAt();
  const result = await fetchPaidOrdersSince(sellerId, since);

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let latestDate = since;

  for (const order of result.results) {
    try {
      const outcome = await importOrder(order);
      if (outcome === 'imported') imported++;
      else if (outcome === 'skipped') skipped++;
      else errors++;
    } catch (error) {
      console.error(`Erro ao importar pedido ML #${order.id}:`, error);
      errors++;
    }

    const orderDate = new Date(order.date_created);
    if (orderDate > latestDate) latestDate = orderDate;
  }

  if (result.results.length > 0) {
    await setLastSyncAt(latestDate);
  }

  return { imported, skipped, errors };
}

async function importOrder(order: MlOrder): Promise<'imported' | 'skipped' | 'error'> {
  const existing = await db.query(
    'SELECT id FROM customer_order WHERE ml_order_id = $1',
    [order.id]
  );
  if (existing.rows.length > 0) return 'skipped';

  const sellerSkus = order.order_items
    .map(i => i.item.seller_sku)
    .filter((sku): sku is string => Boolean(sku));

  if (sellerSkus.length === 0) {
    await createImportErrorReport(order, 'Nenhum seller_sku encontrado nos itens do pedido');
    return 'error';
  }

  const mappingsResult = await db.query<MlSkuMappingRow>(
    `SELECT seller_sku, product_variation_id, quantity_per_unit
     FROM ml_sku_mapping WHERE seller_sku = ANY($1)`,
    [sellerSkus]
  );

  const mappingsBySku = new Map<string, MlSkuMappingRow[]>();
  for (const row of mappingsResult.rows) {
    const list = mappingsBySku.get(row.seller_sku) ?? [];
    list.push(row);
    mappingsBySku.set(row.seller_sku, list);
  }

  for (const sku of sellerSkus) {
    if (!mappingsBySku.has(sku)) {
      await createUnmappedSkuReport(sku, order.id);
    }
  }

  type OrderItemInput = { productVariationId: number; quantity: number; unitPrice: number };
  const itemsToInsert: OrderItemInput[] = [];

  for (const mlItem of order.order_items) {
    if (!mlItem.item.seller_sku) continue;
    const mappings = mappingsBySku.get(mlItem.item.seller_sku);
    if (!mappings) continue;

    for (const m of mappings) {
      itemsToInsert.push({
        productVariationId: m.product_variation_id,
        quantity: mlItem.quantity * m.quantity_per_unit,
        unitPrice: mlItem.unit_price,
      });
    }
  }

  if (itemsToInsert.length === 0) {
    await createImportErrorReport(order, 'Nenhum item pôde ser mapeado para variações internas');
    return 'error';
  }

  const customerId = await findOrCreateCustomer(order.buyer);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Lock stock rows to avoid race conditions with concurrent imports
    const variationIds = [...new Set(itemsToInsert.map(i => i.productVariationId))];
    const stockResult = await client.query<{ id: number; stock: number }>(
      `SELECT id, stock FROM product_variation WHERE id = ANY($1) FOR UPDATE`,
      [variationIds]
    );
    const stockMap = new Map<number, number>(
      stockResult.rows.map(r => [r.id, r.stock] as [number, number])
    );

    type ResolvedItem = {
      productVariationId: number;
      quantity: number;
      unitPrice: number;
      fulfilledQuantity: number;
      status: 'pendente' | 'parcial' | 'atendido';
    };

    const resolvedItems: ResolvedItem[] = [];
    for (const item of itemsToInsert) {
      const available = stockMap.get(item.productVariationId) ?? 0;
      const fulfill = Math.min(available, item.quantity);
      const status: 'pendente' | 'parcial' | 'atendido' =
        fulfill >= item.quantity ? 'atendido' :
        fulfill > 0 ? 'parcial' : 'pendente';

      resolvedItems.push({ ...item, fulfilledQuantity: fulfill, status });
      stockMap.set(item.productVariationId, available - fulfill);
    }

    const enoughItems = resolvedItems.every(i => i.status === 'atendido');

    const dueDate = calcDueDate(new Date(order.date_created));

    const orderResult = await client.query<{ id: number }>(
      `INSERT INTO customer_order (ml_order_id, customer_id, status, total_value, created_at, enough_items, due_date)
       VALUES ($1, $2, 'novo', $3, $4, $5, $6) RETURNING id`,
      [order.id, customerId, order.total_amount, new Date(order.date_created), enoughItems, dueDate]
    );

    const orderId = orderResult.rows[0]!.id;

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_item (order_id, product_variation_id, quantity, unit_price, fulfilled_quantity, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.productVariationId, item.quantity, item.unitPrice, item.fulfilledQuantity, item.status]
      );

      if (item.fulfilledQuantity > 0) {
        await client.query(
          `UPDATE product_variation SET stock = stock - $1 WHERE id = $2`,
          [item.fulfilledQuantity, item.productVariationId]
        );
      }
    }

    await client.query('COMMIT');
    return 'imported';
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findOrCreateCustomer(buyer: MlBuyer): Promise<number> {
  const phone = normalizePhone(buyer.phone?.area_code, buyer.phone?.number);

  if (phone) {
    const found = await db.query<{ id: number }>(
      'SELECT id FROM customer WHERE phone = $1 LIMIT 1',
      [phone]
    );
    if (found.rows.length > 0) return found.rows[0]!.id;
  }

  const name = [buyer.first_name, buyer.last_name].filter(Boolean).join(' ').trim() || buyer.nickname;

  const created = await db.query<{ id: number }>(
    'INSERT INTO customer (name, phone) VALUES ($1, $2) RETURNING id',
    [name, phone ?? null]
  );

  return created.rows[0]!.id;
}

function normalizePhone(areaCode: string | null | undefined, number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = `${areaCode ?? ''}${number}`.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

async function getLastSyncAt(): Promise<Date> {
  const result = await db.query<{ value: string }>(
    `SELECT value FROM integration_config WHERE key = 'ml_last_sync_at'`
  );

  if (result.rows.length > 0) {
    return new Date(result.rows[0]!.value);
  }

  // Primeira execução: busca os últimos 30 dias
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

async function setLastSyncAt(date: Date): Promise<void> {
  await db.query(
    `INSERT INTO integration_config (key, value)
     VALUES ('ml_last_sync_at', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [date.toISOString()]
  );
}

async function createUnmappedSkuReport(sellerSku: string, mlOrderId: number): Promise<void> {
  const existing = await db.query(
    `SELECT id FROM report
     WHERE type = 'ml_sku_unmapped' AND status = 'pending'
       AND metadata->>'sellerSku' = $1`,
    [sellerSku]
  );
  if (existing.rows.length > 0) return;

  await db.query(
    `INSERT INTO report (type, title, message, severity, entity_type, metadata)
     VALUES ('ml_sku_unmapped', $1, $2, 'warning', 'ml_sku', $3)`,
    [
      'SKU do Mercado Livre sem mapeamento',
      `O seller_sku "${sellerSku}" do pedido ML #${mlOrderId} não tem mapeamento cadastrado em ml_sku_mapping.`,
      JSON.stringify({ sellerSku, mlOrderId }),
    ]
  );
}

async function createImportErrorReport(order: MlOrder, reason: string): Promise<void> {
  const existing = await db.query(
    `SELECT id FROM report
     WHERE type = 'ml_order_import_error' AND status = 'pending'
       AND metadata->>'mlOrderId' = $1`,
    [String(order.id)]
  );
  if (existing.rows.length > 0) return;

  await db.query(
    `INSERT INTO report (type, title, message, severity, entity_type, metadata)
     VALUES ('ml_order_import_error', $1, $2, 'warning', 'ml_order', $3)`,
    [
      'Erro ao importar pedido do Mercado Livre',
      `Pedido ML #${order.id} não pôde ser importado: ${reason}.`,
      JSON.stringify({ mlOrderId: order.id, buyer: order.buyer.nickname, reason }),
    ]
  );
}

function calcDueDate(from: Date): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  if (next.getDay() === 0) next.setDate(next.getDate() + 1); // domingo → segunda
  next.setHours(0, 0, 0, 0);
  return next;
}

function readNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
