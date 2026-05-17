-- ============================================================
-- SEED DE DADOS PARA TESTE
-- ============================================================
-- Popula todas as tabelas do sistema com dados fictícios
-- suficientes para exercitar as principais funcionalidades:
--   • Cadastros base (clientes, fornecedores, produtos, materiais)
--   • Variações de produtos e materiais com estoque
--   • Bill of Materials (produto_material)
--   • Relação produto–fornecedor com preços distintos
--   • Pedidos de clientes com itens e status derivados
--   • Processos de fabricação por produto
--   • Trabalhadores cadastrados
-- ============================================================


-- ============================================================
-- 1. DADOS BASE
-- ============================================================

-- ----------------------------------------------------------
-- 1.1 Clientes
-- 10 clientes com nome e telefone fictícios.
-- Alguns clientes aparecerão em mais de um pedido.
-- ----------------------------------------------------------
INSERT INTO customer (name, phone) VALUES
  ('João Silva',      '21999990001'),
  ('Maria Oliveira',  '21999990002'),
  ('Carlos Souza',    '21999990003'),
  ('Ana Costa',       '21999990004'),
  ('Pedro Santos',    '21999990005'),
  ('Juliana Lima',    '21999990006'),
  ('Marcos Pereira',  '21999990007'),
  ('Fernanda Alves',  '21999990008'),
  ('Ricardo Gomes',   '21999990009'),
  ('Patrícia Rocha',  '21999990010');


-- ----------------------------------------------------------
-- 1.2 Fornecedores
-- 5 fornecedores genéricos.
-- A relação com produtos é feita na seção 4.
-- ----------------------------------------------------------
INSERT INTO supplier (name) VALUES
  ('Fornecedor Alpha'),
  ('Fornecedor Beta'),
  ('Fornecedor Gama'),
  ('Fornecedor Delta'),
  ('Fornecedor Omega');


-- ----------------------------------------------------------
-- 1.3 Produtos
-- 20 produtos distribuídos em 6 categorias:
--   Vestuário (10), Esportivo (4), Uniforme (1),
--   Profissional (2), Dormir (2), Acessórios (1)
-- Todos ativos por padrão.
-- ----------------------------------------------------------
INSERT INTO product (name, description, category, active) VALUES
  ('Produto 1',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 2',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 3',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 4',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 5',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 6',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 7',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 8',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 9',  'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 10', 'Lorem ipsum', 'Vestuário',    TRUE),
  ('Produto 11', 'Lorem ipsum', 'Esportivo',    TRUE),
  ('Produto 12', 'Lorem ipsum', 'Esportivo',    TRUE),
  ('Produto 13', 'Lorem ipsum', 'Esportivo',    TRUE),
  ('Produto 14', 'Lorem ipsum', 'Esportivo',    TRUE),
  ('Produto 15', 'Lorem ipsum', 'Uniforme',     TRUE),
  ('Produto 16', 'Lorem ipsum', 'Profissional', TRUE),
  ('Produto 17', 'Lorem ipsum', 'Profissional', TRUE),
  ('Produto 18', 'Lorem ipsum', 'Dormir',       TRUE),
  ('Produto 19', 'Lorem ipsum', 'Dormir',       TRUE),
  ('Produto 20', 'Lorem ipsum', 'Acessórios',   TRUE);


-- ----------------------------------------------------------
-- 1.4 Matérias-primas
-- 10 materiais: 6 vendidos por unidade (UN) e 4 por metro (M).
-- ----------------------------------------------------------
INSERT INTO material (name, base_unit) VALUES
  ('Material 1',  'UN'),
  ('Material 2',  'UN'),
  ('Material 3',  'UN'),
  ('Material 4',  'UN'),
  ('Material 5',  'UN'),
  ('Material 6',  'UN'),
  ('Material 7',  'M'),
  ('Material 8',  'M'),
  ('Material 9',  'M'),
  ('Material 10', 'M');


-- ============================================================
-- 2. VARIAÇÕES E ESTOQUES
-- ============================================================

-- ----------------------------------------------------------
-- 2.1 Variações de materiais
-- Para cada material, gera entre 4 e 10 variações
-- (ex.: cores, bitolas, espessuras) com estoque inicial
-- aleatório entre 0 e 100.
-- ----------------------------------------------------------
DO $$
DECLARE
  m             RECORD;
  qtd_variacoes INT;
  i             INT;
BEGIN
  FOR m IN SELECT id FROM material LOOP

    -- Sorteia quantas variações este material terá (4 a 10)
    qtd_variacoes := (FLOOR(random() * 7 + 4))::INT;

    FOR i IN 1..qtd_variacoes LOOP
      INSERT INTO material_variation (material_id, variation, stock)
      VALUES (
        m.id,
        'Variação ' || i,
        ROUND((random() * 100)::numeric, 2)   -- estoque entre 0 e 100
      );
    END LOOP;

  END LOOP;
END $$;


-- ----------------------------------------------------------
-- 2.2 Variações de produtos
-- Para cada produto, gera entre 6 e 10 variações com:
--   • SKU no formato  SKU-<product_id>-<sequência>
--   • Tamanho aleatório: P / M / G / GG / EXG
--   • Cor aleatória: Preto / Branco / Azul / Vermelho / Verde
--   • Estoque atual entre 0 e 100
--   • Estoque mínimo entre 0 e 10
--   • Preço base entre R$ 50 e R$ 250
-- ----------------------------------------------------------
INSERT INTO product_variation (
  product_id, sku, size, color, stock, minimum_stock, base_price, active
)
SELECT
  p.id,
  'SKU-' || p.id || '-' || gs                                              AS sku,
  (ARRAY['P','M','G','GG','EXG'])[floor(random() * 5)::int + 1]           AS size,
  (ARRAY['Preto','Branco','Azul','Vermelho','Verde'])[floor(random() * 5)::int + 1] AS color,
  ROUND((random() * 100)::numeric, 2)                                      AS stock,
  ROUND((random() * 10)::numeric,  2)                                      AS minimum_stock,
  ROUND((random() * 200 + 50)::numeric, 2)                                 AS base_price,
  TRUE
FROM product p
-- generate_series produz 1 linha por variação; o limite superior varia de 6 a 10
CROSS JOIN LATERAL generate_series(1, (floor(random() * 5) + 6)::int) gs;


-- ----------------------------------------------------------
-- 2.3 Bill of Materials (BOM) — materiais por variação de produto
-- Para cada variação de produto, associa entre 3 e 7 variações
-- de material escolhidas aleatoriamente, com quantidade
-- necessária entre 0,1 e 5,0 (3 casas decimais).
-- ----------------------------------------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT
  vp.id,
  mv.id,
  ROUND((random() * 4.9 + 0.1)::numeric, 3)   -- qtd entre 0.1 e 5.0
FROM product_variation vp
-- Subquery lateral: escolhe de 3 a 7 material_variations aleatórias para cada variação
CROSS JOIN LATERAL (
  SELECT id
  FROM material_variation
  ORDER BY random()
  LIMIT (floor(random() * 5) + 3)::int
) mv;


-- ============================================================
-- 3. RELAÇÃO PRODUTO → FORNECEDOR
-- ============================================================
-- Garante ao menos 1 fornecedor por produto.
-- A distribuição de fornecedores segue o seguinte critério:
--   • ~50 % dos produtos terão 1 fornecedor
--   • ~35 % terão 2 fornecedores
--   • ~15 % terão 3 fornecedores
--
-- O preço de cada fornecedor é independente e varia entre
-- R$ 10 e R$ 160, simulando negociações distintas.
-- A constraint UNIQUE (product_id, supplier_id) da tabela
-- é respeitada: um mesmo fornecedor não é inserido duas vezes
-- para o mesmo produto.
-- ============================================================
DO $$
DECLARE
  p          RECORD;   -- linha de product
  num_sups   INT;      -- quantidade de fornecedores deste produto
  chosen     INT[];    -- ids já inseridos nesta iteração (evita duplicata)
  sup_id     INT;      -- id do fornecedor sorteado
  i          INT;
BEGIN
  FOR p IN SELECT id FROM product LOOP

    -- Sorteia quantos fornecedores este produto terá
    -- Dois random() independentes aproximam as probabilidades descritas acima
    num_sups := CASE
      WHEN random() < 0.50 THEN 1   -- 50 % → 1 fornecedor
      WHEN random() < 0.70 THEN 2   -- 35 % → 2 fornecedores (0.50 a 0.85 do range restante)
      ELSE                       3   -- 15 % → 3 fornecedores
    END;

    chosen := ARRAY[]::int[];   -- reinicia a lista para cada produto

    FOR i IN 1..num_sups LOOP

      -- Sorteia um fornecedor ainda não vinculado a este produto
      SELECT s.id INTO sup_id
      FROM supplier s
      WHERE s.id <> ALL(chosen)
      ORDER BY random()
      LIMIT 1;

      -- Sai do loop se todos os fornecedores já foram usados (improvável, mas seguro)
      EXIT WHEN sup_id IS NULL;

      chosen := array_append(chosen, sup_id);

      INSERT INTO product_supplier (product_id, supplier_id, price)
      VALUES (
        p.id,
        sup_id,
        ROUND((random() * 150 + 10)::numeric, 2)   -- preço entre R$ 10 e R$ 160
      );

    END LOOP;
  END LOOP;
END $$;


-- ============================================================
-- 4. PEDIDOS DE CLIENTES
-- ============================================================

-- ----------------------------------------------------------
-- 4.1 Cabeçalhos dos pedidos
-- 20 pedidos com vencimentos escalonados (1 a 20 dias a partir
-- de hoje). Os clientes 1, 2, 3, 4, 5 e 6 aparecem mais de
-- uma vez para simular clientes recorrentes.
-- Todos iniciam com status 'novo'.
-- ----------------------------------------------------------
INSERT INTO customer_order (customer_id, created_at, status, total_value, due_date) VALUES
  (1, CURRENT_TIMESTAMP, 'novo',  150.00, CURRENT_DATE + INTERVAL '1  day'),
  (2, CURRENT_TIMESTAMP, 'novo',  180.00, CURRENT_DATE + INTERVAL '2  day'),
  (3, CURRENT_TIMESTAMP, 'novo',  210.00, CURRENT_DATE + INTERVAL '3  day'),
  (4, CURRENT_TIMESTAMP, 'novo',  240.00, CURRENT_DATE + INTERVAL '4  day'),
  (5, CURRENT_TIMESTAMP, 'novo',  270.00, CURRENT_DATE + INTERVAL '5  day'),
  (6, CURRENT_TIMESTAMP, 'novo',  300.00, CURRENT_DATE + INTERVAL '6  day'),
  (7, CURRENT_TIMESTAMP, 'novo',  330.00, CURRENT_DATE + INTERVAL '7  day'),
  (8, CURRENT_TIMESTAMP, 'novo',  360.00, CURRENT_DATE + INTERVAL '8  day'),
  (9, CURRENT_TIMESTAMP, 'novo',  390.00, CURRENT_DATE + INTERVAL '9  day'),
  (1, CURRENT_TIMESTAMP, 'novo',  420.00, CURRENT_DATE + INTERVAL '10 day'),
  (2, CURRENT_TIMESTAMP, 'novo',  450.00, CURRENT_DATE + INTERVAL '11 day'),
  (3, CURRENT_TIMESTAMP, 'novo',  480.00, CURRENT_DATE + INTERVAL '12 day'),
  (4, CURRENT_TIMESTAMP, 'novo',  510.00, CURRENT_DATE + INTERVAL '13 day'),
  (5, CURRENT_TIMESTAMP, 'novo',  540.00, CURRENT_DATE + INTERVAL '14 day'),
  (6, CURRENT_TIMESTAMP, 'novo',  570.00, CURRENT_DATE + INTERVAL '15 day'),
  (7, CURRENT_TIMESTAMP, 'novo',  600.00, CURRENT_DATE + INTERVAL '16 day'),
  (8, CURRENT_TIMESTAMP, 'novo',  630.00, CURRENT_DATE + INTERVAL '17 day'),
  (9, CURRENT_TIMESTAMP, 'novo',  660.00, CURRENT_DATE + INTERVAL '18 day'),
  (1, CURRENT_TIMESTAMP, 'novo',  690.00, CURRENT_DATE + INTERVAL '19 day'),
  (2, CURRENT_TIMESTAMP, 'novo',  720.00, CURRENT_DATE + INTERVAL '20 day');


-- ----------------------------------------------------------
-- 4.2 Itens dos pedidos
-- Para cada pedido, gera entre 4 e 10 itens com:
--   • product_variation_id único dentro do mesmo pedido
--   • quantidade pedida entre 1 e 20
--   • fulfilled_quantity:
--       – 20 % de chance de ser zero (item ainda não atendido)
--       – 80 % de chance de valor aleatório entre 1 e quantity
--   • status derivado do atendimento:
--       – 0             → 'pendente'
--       – igual qty     → 'atendido'
--       – entre 0 e qty → 'parcial'
--   • preço unitário entre R$ 20 e R$ 220
-- ----------------------------------------------------------
DO $$
DECLARE
  o         RECORD;   -- linha de customer_order
  pv_id     INT;      -- id da variação de produto sorteada
  num_items INT;      -- total de itens deste pedido
  qty       INT;      -- quantidade pedida
  fulfilled INT;      -- quantidade já atendida
  i         INT;
  used_vars INT[];    -- variações já usadas neste pedido (garante unicidade)
BEGIN
  FOR o IN SELECT id FROM customer_order LOOP

    num_items := (floor(random() * 7) + 4)::int;   -- entre 4 e 10 itens
    used_vars := ARRAY[]::int[];

    FOR i IN 1..num_items LOOP

      -- Sorteia uma variação ainda não usada neste pedido
      SELECT pv.id INTO pv_id
      FROM product_variation pv
      WHERE pv.id <> ALL(used_vars)
      ORDER BY random()
      LIMIT 1;

      EXIT WHEN pv_id IS NULL;   -- segurança: sai se não houver mais variações

      used_vars := array_append(used_vars, pv_id);

      qty := (floor(random() * 20) + 1)::int;

      -- 20 % de chance de atendimento zero, 80 % de atendimento parcial ou total
      IF random() < 0.20 THEN
        fulfilled := 0;
      ELSE
        fulfilled := (floor(random() * qty) + 1)::int;
      END IF;

      INSERT INTO order_item (
        order_id, product_variation_id,
        quantity, unit_price,
        fulfilled_quantity, status
      ) VALUES (
        o.id,
        pv_id,
        qty,
        ROUND((random() * 200 + 20)::numeric, 2),
        fulfilled,
        CASE
          WHEN fulfilled = 0    THEN 'pendente'
          WHEN fulfilled >= qty THEN 'atendido'
          ELSE                       'parcial'
        END
      );

    END LOOP;
  END LOOP;
END $$;


-- ============================================================
-- 5. PRODUÇÃO
-- ============================================================

-- ----------------------------------------------------------
-- 5.1 Processos de fabricação
-- 6 etapas fixas que representam o fluxo típico de confecção.
-- ----------------------------------------------------------
INSERT INTO process (name) VALUES
  ('Corte'),
  ('Costura'),
  ('Estamparia'),
  ('Acabamento'),
  ('Controle de Qualidade'),
  ('Embalagem');


-- ----------------------------------------------------------
-- 5.2 Processos por produto
-- Para cada produto, associa entre 2 e 4 processos escolhidos
-- aleatoriamente, mantendo a ordem (step_order sequencial).
-- O tempo estimado por etapa varia de 15 a 120 minutos.
-- Cada processo aparece no máximo uma vez por produto.
-- ----------------------------------------------------------
DO $$
DECLARE
  p          RECORD;   -- linha de product
  proc_id    INT;      -- id do processo sorteado
  num_procs  INT;      -- quantidade de processos deste produto
  step       INT;      -- contador de ordem das etapas
  used_procs INT[];    -- processos já associados (evita duplicata)
  i          INT;
BEGIN
  FOR p IN SELECT id FROM product LOOP

    num_procs  := (floor(random() * 3) + 2)::int;   -- 2, 3 ou 4 processos
    used_procs := ARRAY[]::int[];
    step       := 1;

    FOR i IN 1..num_procs LOOP

      -- Sorteia um processo ainda não usado neste produto
      SELECT pr.id INTO proc_id
      FROM process pr
      WHERE pr.id <> ALL(used_procs)
      ORDER BY random()
      LIMIT 1;

      EXIT WHEN proc_id IS NULL;

      used_procs := array_append(used_procs, proc_id);

      INSERT INTO product_process (product_id, process_id, step_order, estimated_time)
      VALUES (
        p.id,
        proc_id,
        step,
        ROUND((random() * 105 + 15)::numeric, 2)   -- tempo entre 15 e 120 min
      );

      step := step + 1;

    END LOOP;
  END LOOP;
END $$;


-- ----------------------------------------------------------
-- 5.3 Trabalhadores
-- 5 costureiros cadastrados, todos inativos inicialmente.
-- Ative-os manualmente ou via seed complementar antes de
-- criar ordens de produção reais.
-- ----------------------------------------------------------
INSERT INTO worker (name, active) VALUES
  ('Costureiro 1', FALSE),
  ('Costureiro 2', FALSE),
  ('Costureiro 3', FALSE),
  ('Costureiro 4', FALSE),
  ('Costureiro 5', FALSE);