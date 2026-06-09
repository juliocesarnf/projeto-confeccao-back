INSERT INTO material_supplier (material_id, supplier_id, price)
SELECT m.id, s.id, x.price
FROM (VALUES
  -- ALÇA BÁSICA
  ('Alça Básica',               'Silicone & Cia',        30.00),
  ('Alça Básica',               'Laços Criwall',         30.00),
  ('Alça Básica',               'Alças São Roque',       23.00),
  ('Alça Básica',               'Alças Manoel Duarte',   28.00),
  -- ALÇA AMAMENTAÇÃO
  ('Alça Amamentação',          'Silicone & Cia',        52.00),
  -- COLCHETE BÁSICO
  ('Colchete Básico',           'Laços Criwall',         19.00),
  ('Colchete Básico',           'Silicone & Cia',        22.00),
  ('Colchete Básico',           'Alças São Roque',       20.00),
  ('Colchete Básico',           'RV Malhas',             20.00),
  -- COLCHETE REFORÇADO
  ('Colchete Reforçado',        'Silicone & Cia',        40.00),
  ('Colchete Reforçado',        'Laços Criwall',         35.00),
  -- ELÁSTICO 15
  ('Elástico 15',               'Laços Criwall',         15.00),
  ('Elástico 15',               'Silicone & Cia',        16.00),
  ('Elástico 15',               'Olatex',                17.00),
  -- VIÉS 15
  ('Viés 15',                   'Olatex',                16.00),
  ('Viés 15',                   'Silicone & Cia',        18.00),
  ('Viés 15',                   'Laços Criwall',         18.00),
  ('Viés 15',                   'Alças São Roque',       18.00),
  -- VIÉS 25
  ('Viés 25',                   'Olatex',                40.00),
  ('Viés 25',                   'Silicone & Cia',        40.00),
  ('Viés 25',                   'Laços Criwall',         40.00),
  ('Viés 25',                   'Alças São Roque',       40.00),
  -- ROMANTIC
  ('Romantic',                  'Olatex',                40.00),
  -- BOJOS CASQUINHA
  ('Bojos Casquinha',           'Olatex',                80.00),
  -- RENDA
  ('Renda',                     'JB Rendas',             40.00),
  -- MALHA
  ('Malha',                     'Olatex',                40.00),
  -- PLUMINHA
  ('Pluminha',                  'Olatex',                30.00),
  ('Pluminha',                  'Silicone & Cia',        26.00),
  ('Pluminha',                  'Laços Criwall',         25.00),
  ('Pluminha',                  'Alças São Roque',       22.00),
  -- DECORAÇÕES (Vendedor Especializado)
  ('Borboleta',                 'Vendedor Especializado', 15.00),
  ('Palavra Neon',              'Vendedor Especializado', 10.00),
  ('Borboleta com Palavra',     'Vendedor Especializado', 20.00),
  ('Coração Bordado',           'Vendedor Especializado', 10.00),
  ('Coração Bordado de Palavra','Vendedor Especializado', 15.00),
  ('Laço Borboleta Grande',     'Vendedor Especializado', 5.00),
  ('Pingente Playboy',          'Vendedor Especializado', 40.00),
  ('Palavra Strass',            'Vendedor Especializado',  3.00)
) AS x(material, supplier, price)
JOIN material  m ON m.name = x.material
JOIN supplier  s ON s.name = x.supplier;
