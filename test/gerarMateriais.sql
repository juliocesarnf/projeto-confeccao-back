-- =========================
-- SUPPLIERS
-- =========================
INSERT INTO supplier (name) VALUES
  ('Olatex'),
  ('Silicone & Cia'),
  ('Laços Criwall'),
  ('Alças São Roque'),
  ('Alças Manoel Duarte'),
  ('RV Malhas'),
  ('JB Rendas'),
  ('Vendedor Especializado');

-- =========================
-- MATERIALS
-- =========================
INSERT INTO material (name, base_unit, quantity_per_package) VALUES
  ('Alça Básica',         'PAR', 50),
  ('Alça Amamentação',    'PAR', 50),
  ('Colchete Básico',     'PAR', 100),
  ('Colchete Reforçado',  'PAR', 100),
  ('Elástico 15',         'M',   100),
  ('Viés 15',             'M',   100),
  ('Viés 25',             'M',   100),
  ('Romantic',            'KG',  1),
  ('Bojos Interiço',      'PAR', 40),
  ('Bojos Casquinha',     'PAR', 40),
  ('Renda',               'M',   50),
  ('Suezio',              'KG',  1),
  ('Malha',               'KG',  1),
  ('Pluminha',            'M',   50),
  ('Tule Bordado Coração',        'M',   1),
  ('Arco Pláscito',       'PAR', 50),
  ('Borboleta',           'UN',  10),
  ('Palavra Neon',        'UN',  10),
  ('Borboleta com Palavra',      'UN', 10),
  ('Coração Bordado',            'UN', 10),
  ('Coração Bordado de Palavra', 'UN', 10),
  ('Laço Borboleta Grande',      'UN', 100),
  ('Pingente Playboy',           'UN', 10),
  ('Palavra Strass',             'UN', 10);

-- =========================
-- MATERIAL VARIATIONS (Viés 15, Viés 25, Alça Básica, Alça Amamentação, Colchete Básico e Romantic)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Chocolate'), ('Castanho'), ('Marinho'),
  ('Frozen'), ('Romance'), ('Ruby'), ('Vermelho'), ('Pantera'),
  ('Pink'), ('Odalisca'), ('Satim')
) AS v(variation)
WHERE m.name IN ('Viés 15', 'Viés 25', 'Alça Básica', 'Alça Amamentação', 'Colchete Básico', 'Romantic');

-- =========================
-- MATERIAL VARIATIONS (Rosa Neon: Viés 15, Viés 25, Alça Básica, Colchete Básico e Romantic)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, 'Rosa Neon'
FROM material m
WHERE m.name IN ('Viés 15', 'Viés 25', 'Alça Básica', 'Colchete Básico', 'Romantic');

-- =========================
-- MATERIAL VARIATIONS (Colchete Reforçado)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Chocolate')
) AS v(variation)
WHERE m.name = 'Colchete Reforçado';

-- =========================
-- MATERIAL VARIATIONS (Elástico 15)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, 'Crú'
FROM material m
WHERE m.name = 'Elástico 15';

-- =========================
-- MATERIAL VARIATIONS (Arco Pláscito)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('PP'), ('P'), ('M'), ('G'), ('GG')
) AS v(variation)
WHERE m.name = 'Arco Pláscito';

-- =========================
-- MATERIAL VARIATIONS (Malha)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Branco'), ('Vermelho'), ('Preto'), ('Chocolate')
) AS v(variation)
WHERE m.name = 'Malha';

-- =========================
-- MATERIAL VARIATIONS (Borboleta)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Rosa Neon'), ('Vermelho'), ('Preto'), ('Branco'), ('Frozen')
) AS v(variation)
WHERE m.name = 'Borboleta';

-- =========================
-- MATERIAL VARIATIONS (Palavra Neon) — todas as cores exceto Castanho, Satim e Marinho, + Rosa Neon
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Chocolate'), ('Frozen'), ('Romance'),
  ('Ruby'), ('Vermelho'), ('Pantera'), ('Pink'), ('Odalisca'),
  ('Rosa Neon')
) AS v(variation)
WHERE m.name = 'Palavra Neon';

-- =========================
-- MATERIAL VARIATIONS (Borboleta com Palavra) — mesmas 5 cores da Borboleta
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Rosa Neon'), ('Vermelho'), ('Preto'), ('Branco'), ('Frozen')
) AS v(variation)
WHERE m.name = 'Borboleta com Palavra';

-- =========================
-- MATERIAL VARIATIONS (Renda) — todas as cores
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Chocolate'), ('Castanho'), ('Marinho'),
  ('Frozen'), ('Romance'), ('Ruby'), ('Vermelho'), ('Pantera'),
  ('Pink'), ('Odalisca'), ('Satim')
) AS v(variation)
WHERE m.name = 'Renda';

INSERT INTO material_variation (material_id, variation)
SELECT m.id, 'Rosa Neon'
FROM material m
WHERE m.name = 'Renda';

-- =========================
-- MATERIAL VARIATIONS (Laço Borboleta Grande) — todas as cores
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Chocolate'), ('Castanho'), ('Marinho'),
  ('Frozen'), ('Romance'), ('Ruby'), ('Vermelho'), ('Pantera'),
  ('Pink'), ('Odalisca'), ('Satim')
) AS v(variation)
WHERE m.name = 'Laço Borboleta Grande';

INSERT INTO material_variation (material_id, variation)
SELECT m.id, 'Rosa Neon'
FROM material m
WHERE m.name = 'Laço Borboleta Grande';

-- =========================
-- MATERIAL VARIATIONS (Pingente Playboy)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, 'Padrão'
FROM material m
WHERE m.name = 'Pingente Playboy';

-- =========================
-- MATERIAL VARIATIONS (Palavra Strass)
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, 'Dourada'
FROM material m
WHERE m.name = 'Palavra Strass';

-- =========================
-- MATERIAL VARIATIONS (Coração Bordado e Coração Bordado de Palavra) — cores básicas
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Marinho'),
  ('Frozen'), ('Romance'), ('Ruby'), ('Vermelho'), ('Pantera'),
  ('Pink'), ('Odalisca')
) AS v(variation)
WHERE m.name IN ('Coração Bordado', 'Coração Bordado de Palavra');

-- =========================
-- MATERIAL VARIATIONS (Bojos Casquinha) — tamanhos
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES ('P'), ('M'), ('G'), ('GG')) AS v(variation)
WHERE m.name = 'Bojos Casquinha';

-- =========================
-- MATERIAL VARIATIONS (Pluminha) — cores do sutiã amamentação
-- =========================
INSERT INTO material_variation (material_id, variation)
SELECT m.id, v.variation
FROM material m
CROSS JOIN (VALUES
  ('Preto'), ('Branco'), ('Marinho'),
  ('Frozen'), ('Romance'), ('Ruby'), ('Vermelho'), ('Odalisca')
) AS v(variation)
WHERE m.name = 'Pluminha';

-- =========================
-- STOCK: Alça (Básica e Amamentação) — 100 pares cada cor
-- =========================
UPDATE material_variation mv
SET stock = 100
FROM material m
WHERE m.id = mv.material_id
  AND m.name IN ('Alça Básica', 'Alça Amamentação');

-- =========================
-- STOCK: Malha — 2 kg cada cor
-- =========================
UPDATE material_variation mv
SET stock = 2
FROM material m
WHERE m.id = mv.material_id
  AND m.name = 'Malha';

-- =========================
-- STOCK: Romantic — 2 kg cada cor
-- =========================
UPDATE material_variation mv
SET stock = 2
FROM material m
WHERE m.id = mv.material_id
  AND m.name = 'Romantic';

-- =========================
-- STOCK: Viés (15 e 25) — 200 M cada cor
-- =========================
UPDATE material_variation mv
SET stock = 200
FROM material m
WHERE m.id = mv.material_id
  AND m.name IN ('Viés 15', 'Viés 25');