-- =========================
-- CUSTOMERS
-- =========================
INSERT INTO customer (name) VALUES
('Alessandro'),
('Pimentinha'),
('Luciana'),
('Ignácio'),
('Nanda'),
('Antônio');

-- =========================
-- PRODUCTS
-- =========================
INSERT INTO product (name, description, category) VALUES
('Tanga Borboleta',
 'Tanga fio dental com alças ajustáveis e detalhe de borboleta bordada.',
 'Tanga'),
('Tanga Coração',
 'Tanga fio dental com alças ajustáveis e detalhe de coração bordado.',
 'Tanga'),
('Tanga Coração de Palavra',
 'Tanga fio dental com alças ajustáveis e detalhe de coração com palavras sexy bordadas.',
 'Tanga'),
('Calcinha de Palavra Neon',
 'Calcinha fio dental com palavras sexy em borracha e alça regulável.',
 'Calcinha'),
('Calcinha de Palavra Strass',
 'Calcinha fio dental com palavras sexy douradas com pedras brilhantes (strass) e alça regulável.',
 'Calcinha'),
('Tanga Borboleta de Palavra',
 'Calcinha fio dental que combina borboleta bordada e palavras sexy escritas na borboleta, com alça regulável.',
 'Tanga'),
('Conjunto Coração',
 'Conjunto com calcinha fio dental e sutiã, ambos com alça regulável de coração e uma peça de coração dourada — no sutiã a peça fica na frente e na calcinha atrás. Feito de tule transparente com corações bordados.',
 'Conjunto'),
('Conjunto Floral',
 'Conjunto com calcinha fio dental e sutiã, ambos com alça regulável e detalhe dourado. Feito de renda com detalhes florais.',
 'Conjunto'),
('Sutiã Amamentação de Bojo',
 'Sutiã para amamentação, resistente e com alças reforçadas. Possui bojo que pode ser dobrado para amamentação sem remoção do sutiã.',
 'Sutiã'),
('Tanga Tule Coração',
 'Calcinha fio dental feita de tule com bordados de coração e alça regulável.',
 'Tanga'),
('Tanga Playboy',
 'Tanga fio dental com detalhe de laço borboleta e pingente Playboy.',
 'Tanga');

-- =========================
-- PRODUCT VARIATIONS
-- =========================
-- Tangas / calcinhas: tamanho único (U), cores do conjunto padrão (sem Satim, Castanho e Chocolate)
INSERT INTO product_variation (product_id, sku, size, color, base_price)
SELECT p.id,
       p.name || ' - ' || c.color AS sku,
       'U' AS size,
       c.color,
       NULL AS base_price
FROM product p
CROSS JOIN (VALUES
  ('Preto'),('Branco'),('Marinho'),
  ('Frozen'),('Romance'),('Ruby'),('Vermelho'),('Pantera'),
  ('Pink'),('Odalisca')
) AS c(color)
WHERE p.name IN (
  'Tanga Borboleta',
  'Tanga Coração',
  'Tanga Coração de Palavra',
  'Calcinha de Palavra Neon',
  'Calcinha de Palavra Strass',
  'Tanga Borboleta de Palavra',
  'Tanga Tule Coração',
  'Tanga Playboy'
);

-- Tanga Playboy: cor extra Rosa Neon
INSERT INTO product_variation (product_id, sku, size, color, base_price)
SELECT p.id,
       p.name || ' - Rosa Neon' AS sku,
       'U' AS size,
       'Rosa Neon',
       NULL AS base_price
FROM product p
WHERE p.name = 'Tanga Playboy';

-- Conjunto Coração: tamanhos P/M/G, cores padrão (sem Satim/Castanho/Chocolate) + combinadas
INSERT INTO product_variation (product_id, sku, size, color, base_price)
SELECT p.id,
       p.name || ' - ' || s.size || ' - ' || c.color AS sku,
       s.size,
       c.color,
       NULL AS base_price
FROM product p
CROSS JOIN (VALUES ('P'),('M'),('G'),('GG')) AS s(size)
CROSS JOIN (VALUES
  ('Preto'),('Branco'),('Marinho'),
  ('Frozen'),('Romance'),('Ruby'),('Vermelho'),('Pantera'),
  ('Pink'),('Odalisca'),
  ('Preto e Vermelho'),('Vermelho e Preto'),
  ('Branco e Preto'),('Branco e Vermelho')
) AS c(color)
WHERE p.name = 'Conjunto Coração';

-- Conjunto Floral: tamanhos P/M/G, cores padrão (inalterado)
INSERT INTO product_variation (product_id, sku, size, color, base_price)
SELECT p.id,
       p.name || ' - ' || s.size || ' - ' || c.color AS sku,
       s.size,
       c.color,
       NULL AS base_price
FROM product p
CROSS JOIN (VALUES ('P'),('M'),('G'),('GG')) AS s(size)
CROSS JOIN (VALUES
  ('Preto'),('Branco'),('Chocolate'),('Castanho'),('Marinho'),
  ('Frozen'),('Romance'),('Ruby'),('Vermelho'),('Pantera'),
  ('Pink'),('Odalisca'),('Satim')
) AS c(color)
WHERE p.name = 'Conjunto Floral';

-- Sutiã amamentação: tamanhos por numeração de bojo, cores padrão (sem Pink, Satim, Castanho e Pantera)
INSERT INTO product_variation (product_id, sku, size, color, base_price)
SELECT p.id,
       p.name || ' - ' || s.size || ' - ' || c.color AS sku,
       s.size,
       c.color,
       NULL AS base_price
FROM product p
CROSS JOIN (VALUES ('P'),('M'),('G'),('GG')) AS s(size)
CROSS JOIN (VALUES
  ('Preto'),('Branco'),('Marinho'),
  ('Frozen'),('Romance'),('Ruby'),('Vermelho'),('Odalisca'),
  ('Chocolate')
) AS c(color)
WHERE p.name = 'Sutiã Amamentação de Bojo';