-- =========================
-- WORKERS
-- =========================
INSERT INTO worker (name) VALUES
  ('Samuel'),
  ('Julio'),
  ('Graziele'),
  ('Erika'),
  ('Amanda'),
  ('Daniele'),
  ('Janete'),
  ('Nana');

-- =========================
-- PROCESS
-- =========================
INSERT INTO process (name) VALUES
  ('Cortar'),
  ('Encapar Bojo'),
  ('Pregar Bojo'),
  ('Passar Elástico'),
  ('Pregar Forro'),
  ('Passar Viés'),
  ('Colocar Fecho'),
  ('Travetar'),
  ('Limpar'),
  ('Colar Lacinho'),
  ('Passar Viés no Berço'),
  ('Pregar Alça'),
  ('Passar Plumina'),
  ('Embalar');

-- =========================
-- PRODUCT PROCESS
-- =========================
-- Escala de dificuldade: 1 (muito fácil) → 5 (muito difícil)
-- Referência: cortar peças simples = fácil (1-2), pregar alça = médio (2-3), passar viés = fácil (1-2)

-- Tanga Borboleta
-- Tecido liso com bordado de borboleta com paetês; alça regulável com passador
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta'), (SELECT id FROM process WHERE name = 'Cortar'),       1, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta'), (SELECT id FROM process WHERE name = 'Pregar Forro'), 2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta'), (SELECT id FROM process WHERE name = 'Passar Viés'),  3, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta'), (SELECT id FROM process WHERE name = 'Pregar Alça'),  4, 4 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta'), (SELECT id FROM process WHERE name = 'Limpar'),       5, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta'), (SELECT id FROM process WHERE name = 'Embalar'),      6, 2;

-- Tanga Coração
-- Tanga simples com detalhe de coração bordado; construção básica
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração'), (SELECT id FROM process WHERE name = 'Cortar'),       1, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração'), (SELECT id FROM process WHERE name = 'Pregar Forro'), 2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração'), (SELECT id FROM process WHERE name = 'Passar Viés'),  3, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração'), (SELECT id FROM process WHERE name = 'Pregar Alça'),  4, 3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração'), (SELECT id FROM process WHERE name = 'Limpar'),       5, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração'), (SELECT id FROM process WHERE name = 'Embalar'),      6, 2;

-- Tanga Coração de Palavra
-- Igual à Tanga Coração mas com palavras bordadas no coração; detalhe exige atenção na costura
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração de Palavra'), (SELECT id FROM process WHERE name = 'Cortar'),       1, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração de Palavra'), (SELECT id FROM process WHERE name = 'Pregar Forro'), 2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração de Palavra'), (SELECT id FROM process WHERE name = 'Passar Viés'),  3, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração de Palavra'), (SELECT id FROM process WHERE name = 'Pregar Alça'),  4, 3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração de Palavra'), (SELECT id FROM process WHERE name = 'Limpar'),       5, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Coração de Palavra'), (SELECT id FROM process WHERE name = 'Embalar'),      6, 2;

-- Tanga Borboleta de Palavra
-- Combina borboleta e palavras; mais detalhes para alinhar e pregar corretamente
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta de Palavra'), (SELECT id FROM process WHERE name = 'Cortar'),       1, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta de Palavra'), (SELECT id FROM process WHERE name = 'Pregar Forro'), 2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta de Palavra'), (SELECT id FROM process WHERE name = 'Passar Viés'),  3, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta de Palavra'), (SELECT id FROM process WHERE name = 'Pregar Alça'),  4, 4 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta de Palavra'), (SELECT id FROM process WHERE name = 'Limpar'),       5, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Borboleta de Palavra'), (SELECT id FROM process WHERE name = 'Embalar'),      6, 2;

-- Tanga Playboy
-- Peça simples com laço e pingente Playboy; construção básica
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Cortar'),        1, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Pregar Forro'),  2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Passar Viés'),   3, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Pregar Alça'),   4, 3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Colar Lacinho'), 5, 3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Limpar'),        6, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Tanga Playboy'), (SELECT id FROM process WHERE name = 'Embalar'),       7, 2;

-- Calcinha de Palavra Neon
-- Fio dental com palavras em borracha neon; construção simples, aplicação da palavra é pré-pronta
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Neon'), (SELECT id FROM process WHERE name = 'Cortar'),       1, 1 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Neon'), (SELECT id FROM process WHERE name = 'Pregar Forro'), 2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Neon'), (SELECT id FROM process WHERE name = 'Passar Viés'),  3, 1 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Neon'), (SELECT id FROM process WHERE name = 'Pregar Alça'),  4, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Neon'), (SELECT id FROM process WHERE name = 'Limpar'),       5, 1 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Neon'), (SELECT id FROM process WHERE name = 'Embalar'),      6, 1;

-- Calcinha de Palavra Strass
-- Palavras douradas com pedras strass; pedras são frágeis e exigem cuidado extra no limpar e embalar
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Strass'), (SELECT id FROM process WHERE name = 'Cortar'),       1, 1 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Strass'), (SELECT id FROM process WHERE name = 'Pregar Forro'), 2, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Strass'), (SELECT id FROM process WHERE name = 'Passar Viés'),  3, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Strass'), (SELECT id FROM process WHERE name = 'Pregar Alça'),  4, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Strass'), (SELECT id FROM process WHERE name = 'Limpar'),       5, 2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Calcinha de Palavra Strass'), (SELECT id FROM process WHERE name = 'Embalar'),      6, 2;

-- Sutiã Amamentação de Bojo
-- Peça mais complexa: estruturada, muitas partes, fecho especial de amamentação
-- Encapar e pregar bojo exigem habilidade avançada para simetria e acabamento sem vincos
-- Colocar fecho de amamentação requer posicionamento preciso e fixação segura
INSERT INTO product_process (product_id, process_id, step_order, dificulty_level)
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Cortar'),               1,  2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Encapar Bojo'),         2,  3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Pregar Bojo'),          3,  2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Passar Plumina'),       4,  2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Passar Elástico'),      5,  2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Passar Viés no Berço'), 6,  2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Passar Viés'),          7,  2 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Pregar Alça'),          8,  3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Colocar Fecho'),        9,  3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Colar Lacinho'),       10,  1 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Limpar'),              11,  3 UNION ALL
SELECT (SELECT id FROM product WHERE name = 'Sutiã Amamentação de Bojo'), (SELECT id FROM process WHERE name = 'Embalar'),             12,  2;
