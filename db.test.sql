-- ============================================================
-- SEED DE DADOS PARA TESTE
-- ============================================================

-- ============================================================
-- 0 – LIMPEZA DAS TABELAS
-- ============================================================
TRUNCATE TABLE
  production_batch_worker,
  production_batch_item,
  production_batch,
  production_item,
  production,
  report,
  order_item,
  customer_order,
  product_material,
  material_supplier,
  product_variation,
  product_process,
  product,
  material_variation,
  material,
  process,
  worker,
  supplier,
  customer
RESTART IDENTITY CASCADE;


-- ============================================================
-- 1. DADOS BASE
-- ============================================================

INSERT INTO customer (name, phone) VALUES
  ('Loja AAA', '21999990001'),
  ('Loja BBB', '21999990002'),
  ('Loja CCC', '21999990003'),
  ('Loja DDD', '21999990004'),
  ('Loja EEE', '21999990005'),
  ('Loja FFF', '21999990006'),
  ('Loja GGG', '21999990007'),
  ('Loja HHH', '21999990008'),
  ('Loja III', '21999990009'),
  ('Loja JJJ', '21999990010');

INSERT INTO supplier (name) VALUES
  ('Fornecedor Alpha'),
  ('Fornecedor Beta'),
  ('Fornecedor Gama'),
  ('Fornecedor Delta'),
  ('Fornecedor Omega');

INSERT INTO product (name, description, category, active) VALUES
  ('Produto 1',  'Lorem ipsum', 'Lingerie',  TRUE),
  ('Produto 2',  'Lorem ipsum', 'Lingerie',  TRUE),
  ('Produto 3',  'Lorem ipsum', 'Lingerie',  TRUE),
  ('Produto 4',  'Lorem ipsum', 'Lingerie',  TRUE),
  ('Produto 5',  'Lorem ipsum', 'Lingerie',  TRUE),
  ('Produto 6',  'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 7',  'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 8',  'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 9',  'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 10', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 11', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 12', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 13', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 14', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 15', 'Lorem ipsum', 'Conjunto',  TRUE),
  ('Produto 16', 'Lorem ipsum', 'Conjunto',  TRUE),
  ('Produto 17', 'Lorem ipsum', 'Conjunto',  TRUE),
  ('Produto 18', 'Lorem ipsum', 'Conjunto',  TRUE),
  ('Produto 19', 'Lorem ipsum', 'Conjunto',  TRUE),
  ('Produto 20', 'Lorem ipsum', 'Conjunto',  TRUE);

-- MATERIAIS COM QUANTIDADE POR PACOTE (1, 50 ou 100)
INSERT INTO material (name, base_unit, quantity_per_package) VALUES
  ('Material 1',  'UN', (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 2',  'UN', (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 3',  'UN', (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 4',  'UN', (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 5',  'UN', (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 6',  'UN', (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 7',  'M',  (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 8',  'M',  (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 9',  'M',  (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]),
  ('Material 10', 'M',  (ARRAY[1, 50, 100])[floor(random() * 3)::int + 1]);


-- ============================================================
-- 2. VARIAÇÕES E ESTOQUES
-- ============================================================

-- ----------------------------------------------------------
-- 2.1 Variações de materiais (4–10 por material)
-- ----------------------------------------------------------
DO $$
DECLARE
  m             RECORD;
  qtd_variacoes INT;
  i             INT;
BEGIN
  FOR m IN SELECT id FROM material LOOP
    qtd_variacoes := (FLOOR(random() * 7 + 4))::INT;
    FOR i IN 1..qtd_variacoes LOOP
      INSERT INTO material_variation (material_id, variation, stock)
      VALUES (
        m.id,
        'Variação ' || i,
        ROUND(
          CASE
            WHEN random() < 0.20 THEN   50 + random() *  150
            WHEN random() < 0.70 THEN  200 + random() *  800
            ELSE                       1000 + random() * 4000
          END
        ::numeric, 2)
      );
    END LOOP;
  END LOOP;
END $$;


-- ----------------------------------------------------------
-- 2.2 Fornecedores por material
-- ----------------------------------------------------------
DO $$
DECLARE
  m        RECORD;
  num_sups INT;
  chosen   INT[];
  sup_id   INT;
  i        INT;
BEGIN
  FOR m IN SELECT id FROM material LOOP

    num_sups := (FLOOR(random() * 3) + 2)::INT; -- 2 a 4

    chosen := ARRAY[]::int[];

    FOR i IN 1..num_sups LOOP
      SELECT s.id INTO sup_id
      FROM supplier s
      WHERE s.id <> ALL(chosen)
      ORDER BY random()
      LIMIT 1;

      EXIT WHEN sup_id IS NULL;

      chosen := array_append(chosen, sup_id);

      INSERT INTO material_supplier (material_id, supplier_id, price)
      VALUES (
        m.id,
        sup_id,
        ROUND((random() * 45 + 5)::numeric, 2)
      );
    END LOOP;

  END LOOP;
END $$;


-- ----------------------------------------------------------
-- 2.3 Variações de produtos (6–10 por produto)
-- ----------------------------------------------------------
INSERT INTO product_variation (
  product_id, sku, size, color, stock, minimum_stock, base_price, active
)
SELECT
  p.id,
  'SKU-' || p.id || '-' || gs                                                        AS sku,
  (ARRAY['P','M','G','GG','EXG'])[floor(random() * 5)::int + 1]                     AS size,
  (ARRAY['Preto','Branco','Azul','Vermelho','Verde'])[floor(random() * 5)::int + 1]  AS color,
  (20 + floor(random() * 181))::int                                                  AS stock,
  (10 + floor(random() * 41))::int                                                   AS minimum_stock,
  ROUND((random() * 200 + 50)::numeric, 2)                                           AS base_price,
  TRUE
FROM product p
CROSS JOIN LATERAL generate_series(1, (floor(random() * 5) + 6)::int) gs;


-- ----------------------------------------------------------
-- 2.4 Bill of Materials — 3 a 6 materiais aleatórios por PRODUTO
--     (o mesmo conjunto de materiais se aplica a todas as
--      variações daquele produto)
-- ----------------------------------------------------------
DO $$
DECLARE
  p             RECORD;
  qtd_materiais INT;
  chosen_mats   INT[];
  mat_id        INT;
  vp            RECORD;
  mv_id         INT;
  i             INT;
BEGIN
  FOR p IN SELECT id FROM product LOOP

    qtd_materiais := (FLOOR(random() * 4) + 3)::INT; -- 3 a 6
    chosen_mats   := ARRAY[]::INT[];

    FOR i IN 1..qtd_materiais LOOP
      SELECT m.id INTO mat_id
      FROM material m
      WHERE m.id <> ALL(chosen_mats)
      ORDER BY random()
      LIMIT 1;

      EXIT WHEN mat_id IS NULL;

      chosen_mats := array_append(chosen_mats, mat_id);
    END LOOP;

    FOR vp IN SELECT id FROM product_variation WHERE product_id = p.id LOOP
      FOREACH mat_id IN ARRAY chosen_mats LOOP

        SELECT mv.id INTO mv_id
        FROM material_variation mv
        WHERE mv.material_id = mat_id
        ORDER BY random()
        LIMIT 1;

        IF mv_id IS NOT NULL THEN
          INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
          VALUES (vp.id, mv_id, ROUND((random() * 4.9 + 0.1)::numeric, 3));
        END IF;

      END LOOP;
    END LOOP;

  END LOOP;
END $$;


-- ============================================================
-- 3. PEDIDOS DE CLIENTES
-- ============================================================

DO $$
DECLARE
  day_slots INT[][] := ARRAY[
    ARRAY[0,  3], ARRAY[1,  3], ARRAY[2,  3], ARRAY[3,  3], ARRAY[4,  3],
    ARRAY[5,  2], ARRAY[6,  2], ARRAY[7,  2], ARRAY[8,  2], ARRAY[9,  2],
    ARRAY[10, 2], ARRAY[12, 2], ARRAY[14, 2], ARRAY[17, 2], ARRAY[20, 2],
    ARRAY[23, 2], ARRAY[25, 2], ARRAY[28, 2], ARRAY[30, 2]
  ];

  order_dates        TIMESTAMP[];
  slot               INT[];
  dias_atras         INT;
  qtd_dia            INT;
  d                  INT;

  order_index        INT := 0;
  new_order_id       INT;
  cust_id            INT;
  venc               DATE;
  total_acc          NUMERIC(10,2);

  num_items          INT;
  qty_ordered        INT;
  unit_p             NUMERIC(10,2);

  fulfilled_qty      INT;
  item_status        VARCHAR(50);

  used_pv_ids        INT[];
  used_product_ids   INT[];

  chosen_product_id  INT;
  pv_row             RECORD;
  i                  INT;

BEGIN

  order_dates := ARRAY[]::TIMESTAMP[];

  FOREACH slot SLICE 1 IN ARRAY day_slots LOOP
    dias_atras := slot[1];
    qtd_dia    := slot[2];
    FOR d IN 1..qtd_dia LOOP
      order_dates := array_append(
        order_dates,
        (CURRENT_DATE - dias_atras * INTERVAL '1 day')
          + INTERVAL '8 hours'
          + (random() * INTERVAL '8 hours')
      );
    END LOOP;
  END LOOP;

  WHILE array_length(order_dates, 1) < 50 LOOP
    order_dates := array_append(
      order_dates,
      CURRENT_TIMESTAMP - (random() * INTERVAL '5 days')
    );
  END LOOP;

  FOR order_index IN 1..50 LOOP

    cust_id := ((order_index - 1) % 9) + 1;

    venc := order_dates[order_index]::DATE
              + ((floor(random() * 34) + 7)::INT * INTERVAL '1 day');

    INSERT INTO customer_order (
      customer_id, created_at, status, total_value, due_date, enough_items
    ) VALUES (
      cust_id,
      order_dates[order_index],
      'novo',
      0.00,
      venc,
      FALSE
    )
    RETURNING id INTO new_order_id;

    num_items   := (floor(random() * 9) + 4)::INT;
    used_pv_ids := ARRAY[]::INT[];
    total_acc   := 0;

    -- Pedidos 1–25: MONO-PRODUTO
    IF order_index <= 25 THEN

      SELECT id INTO chosen_product_id
      FROM product
      ORDER BY random()
      LIMIT 1;

      FOR i IN 1..num_items LOOP

        SELECT pv.id, pv.base_price
          INTO pv_row
          FROM product_variation pv
         WHERE pv.product_id = chosen_product_id
           AND pv.id <> ALL(used_pv_ids)
         ORDER BY random()
         LIMIT 1;

        EXIT WHEN pv_row IS NULL;

        used_pv_ids   := array_append(used_pv_ids, pv_row.id);
        qty_ordered   := ((floor(random() * 23) + 2)::INT) * 5;
        unit_p        := ROUND((pv_row.base_price * (0.85 + random() * 0.30))::NUMERIC, 2);
        fulfilled_qty := ROUND(qty_ordered * (0.10 + random() * 0.10))::INT;
        item_status   := CASE WHEN fulfilled_qty > 0 THEN 'parcial' ELSE 'pendente' END;

        INSERT INTO order_item (
          order_id, product_variation_id,
          quantity, unit_price,
          fulfilled_quantity, status
        ) VALUES (
          new_order_id, pv_row.id,
          qty_ordered, unit_p,
          fulfilled_qty, item_status
        );

        total_acc := total_acc + (qty_ordered * unit_p);

      END LOOP;

    -- Pedidos 26–50: MULTI-PRODUTO
    ELSE

      used_product_ids := ARRAY[]::INT[];

      FOR i IN 1..num_items LOOP

        SELECT pv.id, pv.base_price
          INTO pv_row
          FROM product_variation pv
         WHERE pv.product_id <> ALL(used_product_ids)
           AND pv.id         <> ALL(used_pv_ids)
         ORDER BY random()
         LIMIT 1;

        EXIT WHEN pv_row IS NULL;

        SELECT product_id INTO chosen_product_id
          FROM product_variation
         WHERE id = pv_row.id;

        used_product_ids := array_append(used_product_ids, chosen_product_id);
        used_pv_ids      := array_append(used_pv_ids,      pv_row.id);

        qty_ordered   := ((floor(random() * 23) + 2)::INT) * 5;
        unit_p        := ROUND((pv_row.base_price * (0.85 + random() * 0.30))::NUMERIC, 2);
        fulfilled_qty := ROUND(qty_ordered * (0.10 + random() * 0.10))::INT;
        item_status   := CASE WHEN fulfilled_qty > 0 THEN 'parcial' ELSE 'pendente' END;

        INSERT INTO order_item (
          order_id, product_variation_id,
          quantity, unit_price,
          fulfilled_quantity, status
        ) VALUES (
          new_order_id, pv_row.id,
          qty_ordered, unit_p,
          fulfilled_qty, item_status
        );

        total_acc := total_acc + (qty_ordered * unit_p);

      END LOOP;

    END IF;

    UPDATE customer_order
       SET total_value = ROUND(total_acc, 2)
     WHERE id = new_order_id;

  END LOOP;

END $$;


-- ============================================================
-- 4. PRODUÇÃO
-- ============================================================

INSERT INTO process (name) VALUES
  ('Corte'),
  ('Costura'),
  ('Estamparia'),
  ('Acabamento'),
  ('Controle de Qualidade'),
  ('Embalagem');

DO $$
DECLARE
  p          RECORD;
  proc_id    INT;
  num_procs  INT;
  step       INT;
  used_procs INT[];
  i          INT;
BEGIN
  FOR p IN SELECT id FROM product LOOP
    num_procs  := (floor(random() * 3) + 2)::int;
    used_procs := ARRAY[]::int[];
    step       := 1;
    FOR i IN 1..num_procs LOOP
      SELECT pr.id INTO proc_id
      FROM process pr
      WHERE pr.id <> ALL(used_procs)
      ORDER BY random()
      LIMIT 1;
      EXIT WHEN proc_id IS NULL;
      used_procs := array_append(used_procs, proc_id);
      INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
      VALUES (p.id, proc_id, step, ROUND((random() * 6 + 2)::numeric, 2));
      step := step + 1;
    END LOOP;
  END LOOP;
END $$;

INSERT INTO worker (name, active) VALUES
  ('Costureiro 1', TRUE),
  ('Costureiro 2', TRUE),
  ('Costureiro 3', TRUE),
  ('Costureiro 4', TRUE),
  ('Costureiro 5', TRUE);