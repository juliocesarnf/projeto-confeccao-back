-- =========================
-- PRODUCT MATERIAL (BOM)
-- Produtos: Tanga Coração, Tanga Coração de Palavra, Tanga Borboleta,
--           Calcinha de Palavra Neon, Calcinha de Palavra Strass,
--           Tanga Borboleta de Palavra
--
-- Regras:
--   - 1 PAR de Alça Básica da MESMA cor da variação do produto.
--   - 0,001 KG de forro (Malha):
--       cor da variação = Vermelho -> Malha Vermelho
--       cor da variação = Preto    -> Malha Preto
--       qualquer outra cor         -> Malha Branco
-- =========================

-- -------------------------
-- ALÇA BÁSICA (mesma cor) — 1 par
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Alça Básica'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name IN (
  'Tanga Coração',
  'Tanga Coração de Palavra',
  'Tanga Borboleta',
  'Calcinha de Palavra Neon',
  'Calcinha de Palavra Strass',
  'Tanga Borboleta de Palavra'
);

-- -------------------------
-- RENDA (mesma cor) — 0,1 M
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Renda'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name IN ('Calcinha de Palavra Neon', 'Calcinha de Palavra Strass');

-- -------------------------
-- PALAVRA NEON (mesma cor) — 1 UN
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Palavra Neon'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Calcinha de Palavra Neon';

-- -------------------------
-- PALAVRA STRASS (Dourada) — 1 UN
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Palavra Strass'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = 'Dourada'
WHERE p.name = 'Calcinha de Palavra Strass';

-- -------------------------
-- VIÉS 15 (mesma cor) — 1 M
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.8
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Viés 15'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name IN (
  'Tanga Borboleta',
  'Tanga Coração',
  'Tanga Coração de Palavra',
  'Tanga Borboleta de Palavra'
);

-- -------------------------
-- ROMANTIC (mesma cor) — 0,03 kg
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.03
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Romantic'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name IN (
  'Tanga Borboleta',
  'Tanga Coração',
  'Tanga Coração de Palavra',
  'Tanga Borboleta de Palavra'
);

-- -------------------------
-- SUTIÃ AMAMENTAÇÃO DE BOJO — BOM
-- -------------------------

-- Bojos Casquinha (mesmo tamanho) — 1 par
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Bojos Casquinha'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.size
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- Alça Amamentação (mesma cor) — 1 par
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Alça Amamentação'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- Colchete Básico (mesma cor) — 1 par
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Colchete Básico'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- Elástico 15 (Crú) — 0,4 M
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.4
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Elástico 15'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = 'Crú'
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- Viés 15 (mesma cor) — 1,7 M
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1.7
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Viés 15'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- Pluminha (mesma cor) — 0,4 M
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.4
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Pluminha'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- Romantic (mesma cor) — 0,1 KG
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Romantic'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Sutiã Amamentação de Bojo';

-- -------------------------
-- FORRO (Malha) — 0,001 kg
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.001
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Malha'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = CASE
                                 WHEN pv.color = 'Vermelho' THEN 'Vermelho'
                                 WHEN pv.color = 'Preto'    THEN 'Preto'
                                 ELSE 'Branco'
                               END
WHERE p.name IN (
  'Tanga Coração',
  'Tanga Coração de Palavra',
  'Tanga Borboleta',
  'Calcinha de Palavra Neon',
  'Calcinha de Palavra Strass',
  'Tanga Borboleta de Palavra'
);

-- -------------------------
-- BORBOLETA (mesma cor) — 1 UN → Tanga Borboleta
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Borboleta'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Tanga Borboleta';

-- -------------------------
-- CORAÇÃO BORDADO (mesma cor) — 1 UN → Tanga Coração
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Coração Bordado'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Tanga Coração';

-- -------------------------
-- CORAÇÃO BORDADO DE PALAVRA (mesma cor) — 1 UN → Tanga Coração de Palavra
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Coração Bordado de Palavra'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Tanga Coração de Palavra';

-- -------------------------
-- VIÉS 15 (mesma cor) — 0,8 M → Calcinha de Palavra Neon
-- -------------------------
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.8
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Viés 15'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name IN ('Calcinha de Palavra Neon', 'Calcinha de Palavra Strass');

-- -------------------------
-- TANGA PLAYBOY — BOM
-- -------------------------

-- Renda (mesma cor) — 0,2 M
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.2
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Renda'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Tanga Playboy';

-- Viés 15 (mesma cor) — 1 M
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Viés 15'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Tanga Playboy';

-- Forro (Malha) — 0,002 KG
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 0.002
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Malha'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = CASE
                                 WHEN pv.color = 'Vermelho' THEN 'Vermelho'
                                 WHEN pv.color = 'Preto'    THEN 'Preto'
                                 ELSE 'Branco'
                               END
WHERE p.name = 'Tanga Playboy';

-- Laço Borboleta Grande (mesma cor) — 1 UN
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Laço Borboleta Grande'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = pv.color
WHERE p.name = 'Tanga Playboy';

-- Pingente Playboy — 1 UN
INSERT INTO product_material (product_variation_id, material_variation_id, quantity)
SELECT pv.id, mv.id, 1
FROM product_variation pv
JOIN product p              ON p.id = pv.product_id
JOIN material m             ON m.name = 'Pingente Playboy'
JOIN material_variation mv  ON mv.material_id = m.id
                           AND mv.variation = 'Padrão'
WHERE p.name = 'Tanga Playboy';