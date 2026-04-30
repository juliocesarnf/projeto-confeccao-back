-- =========================
-- CLIENTE
-- =========================
CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FORNECEDOR
-- =========================
CREATE TABLE fornecedor (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUTO
-- =========================
CREATE TABLE produto (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE
);

-- =========================
-- VARIACAO PRODUTO
-- =========================
CREATE TABLE variacao_produto (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL,
  sku VARCHAR(100),
  tamanho VARCHAR(50),
  cor VARCHAR(50),
  estoque NUMERIC(10,2) DEFAULT 0,
  estoque_minimo NUMERIC(10,2) DEFAULT 0,
  valor_base NUMERIC(10,2),
  ativo BOOLEAN DEFAULT TRUE,

  CONSTRAINT fk_variacao_produto
    FOREIGN KEY (produto_id) REFERENCES produto(id)
);

-- =========================
-- PEDIDO
-- =========================
CREATE TABLE pedido (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('novo','confirmado','em_producao','finalizado','cancelado')),
  valor_total NUMERIC(10,2),
  prazo DATE,

  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- =========================
-- ITEM PEDIDO
-- =========================
CREATE TABLE item_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  variacao_produto_id INT NOT NULL,

  quantidade INT NOT NULL,
  preco_unitario NUMERIC(10,2),

  quantidade_atendida INT DEFAULT 0,

  status VARCHAR(50) CHECK (status IN ('pendente','parcial','atendido')),

  CONSTRAINT fk_item_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedido(id),

  CONSTRAINT fk_item_variacao
    FOREIGN KEY (variacao_produto_id) REFERENCES variacao_produto(id)
);

-- =========================
-- MATERIAL
-- =========================
CREATE TABLE material (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  unidade_base VARCHAR(50)
);

-- =========================
-- MATERIAL VARIACAO
-- =========================
CREATE TABLE material_variacao (
  id SERIAL PRIMARY KEY,
  material_id INT NOT NULL,
  variacao VARCHAR(100),
  estoque NUMERIC(10,2) DEFAULT 0,

  CONSTRAINT fk_material
    FOREIGN KEY (material_id) REFERENCES material(id)
);

-- =========================
-- PRODUTO MATERIAL (BOM)
-- =========================
CREATE TABLE produto_material (
  id SERIAL PRIMARY KEY,
  variacao_produto_id INT NOT NULL,
  material_variacao_id INT NOT NULL,
  quantidade NUMERIC(10,3) NOT NULL,

  CONSTRAINT fk_pm_variacao
    FOREIGN KEY (variacao_produto_id) REFERENCES variacao_produto(id),

  CONSTRAINT fk_pm_material
    FOREIGN KEY (material_variacao_id) REFERENCES material_variacao(id)
);

-- =========================
-- PROCESSO
-- =========================
CREATE TABLE processo (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
);

-- =========================
-- PRODUTO PROCESSO
-- =========================
CREATE TABLE produto_processo (
  id SERIAL PRIMARY KEY,
  produto_id INT NOT NULL,
  processo_id INT NOT NULL,
  ordem INT,
  tempo_estimado NUMERIC(10,2),

  CONSTRAINT fk_pp_produto
    FOREIGN KEY (produto_id) REFERENCES produto(id),

  CONSTRAINT fk_pp_processo
    FOREIGN KEY (processo_id) REFERENCES processo(id)
);

-- =========================
-- COSTUREIRO
-- =========================
CREATE TABLE costureiro (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
);

-- =========================
-- PRODUCAO
-- =========================
CREATE TABLE producao (
  id SERIAL PRIMARY KEY,
  pedido_id INT,

  status VARCHAR(50) CHECK (status IN (
    'planejado','aguardando_material','em_andamento','pausado','finalizado','cancelado'
  )),

  data_inicio TIMESTAMP,
  data_prevista_fim TIMESTAMP,
  data_fim TIMESTAMP,

  CONSTRAINT fk_producao_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedido(id)
);

-- =========================
-- PRODUCAO ITEM
-- =========================
CREATE TABLE producao_item (
  id SERIAL PRIMARY KEY,
  producao_id INT NOT NULL,
  item_pedido_id INT,
  variacao_produto_id INT NOT NULL,

  quantidade_planejada INT,
  quantidade_produzida INT DEFAULT 0,

  status VARCHAR(50) CHECK (status IN (
    'pendente','em_producao','parcial','concluido'
  )),

  CONSTRAINT fk_pi_producao
    FOREIGN KEY (producao_id) REFERENCES producao(id),

  CONSTRAINT fk_pi_item
    FOREIGN KEY (item_pedido_id) REFERENCES item_pedido(id),

  CONSTRAINT fk_pi_variacao
    FOREIGN KEY (variacao_produto_id) REFERENCES variacao_produto(id)
);

-- =========================
-- PRODUCAO PROCESSO
-- =========================
CREATE TABLE producao_processo (
  id SERIAL PRIMARY KEY,
  producao_item_id INT NOT NULL,

  processo_nome VARCHAR(255),
  ordem INT,

  status VARCHAR(50) CHECK (status IN ('pendente','fazendo','concluido')),

  data_inicio TIMESTAMP,
  data_fim TIMESTAMP,

  tempo_estimado NUMERIC(10,2),
  tempo_real NUMERIC(10,2),

  costureiro_id INT,

  CONSTRAINT fk_pp_item
    FOREIGN KEY (producao_item_id) REFERENCES producao_item(id),

  CONSTRAINT fk_pp_costureiro
    FOREIGN KEY (costureiro_id) REFERENCES costureiro(id)
);

-- =========================
-- ÍNDICES IMPORTANTES
-- =========================
CREATE INDEX idx_pedido_cliente ON pedido(cliente_id);
CREATE INDEX idx_item_pedido ON item_pedido(pedido_id);
CREATE INDEX idx_producao_pedido ON producao(pedido_id);
CREATE INDEX idx_producao_item ON producao_item(producao_id);