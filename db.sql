-- =========================
-- CUSTOMER
-- =========================
CREATE TABLE customer (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- SUPPLIER
-- =========================
CREATE TABLE supplier (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCT
-- =========================
CREATE TABLE product (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  active BOOLEAN DEFAULT TRUE
);

-- =========================
-- PRODUCT VARIATION
-- =========================
CREATE TABLE product_variation (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  sku VARCHAR(100),
  size VARCHAR(50),
  color VARCHAR(50),
  stock NUMERIC(10,2) DEFAULT 0,
  minimum_stock NUMERIC(10,2) DEFAULT 0,
  base_price NUMERIC(10,2),
  active BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (product_id) REFERENCES product(id)
);

-- =========================
-- PRODUCT SUPPLIERS
-- =========================
CREATE TABLE product_supplier (
  id           SERIAL        PRIMARY KEY,
  product_id   INT           NOT NULL REFERENCES product(id)   ON DELETE CASCADE,
  supplier_id  INT           NOT NULL REFERENCES supplier(id)  ON DELETE CASCADE,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, supplier_id)
);

-- =========================
-- ORDER
-- =========================
CREATE TABLE customer_order (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) CHECK (
    status IN ('novo','producao','confirmado','finalizado','cancelado')
  ),
  total_value NUMERIC(10,2),
  due_date DATE,
  enough_items BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- =========================
-- ORDER ITEM
-- =========================
CREATE TABLE order_item (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_variation_id INT NOT NULL,

  quantity INT NOT NULL,
  unit_price NUMERIC(10,2),

  fulfilled_quantity INT DEFAULT 0,

  status VARCHAR(50) CHECK (
    status IN ('pendente','parcial','atendido')
  ),

  FOREIGN KEY (order_id) REFERENCES customer_order(id),
  FOREIGN KEY (product_variation_id) REFERENCES product_variation(id)
);

-- =========================
-- MATERIAL
-- =========================
CREATE TABLE material (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_unit VARCHAR(50)
);

-- =========================
-- MATERIAL VARIATION
-- =========================
CREATE TABLE material_variation (
  id SERIAL PRIMARY KEY,
  material_id INT NOT NULL,
  variation VARCHAR(100),
  stock NUMERIC(10,2) DEFAULT 0,

  FOREIGN KEY (material_id) REFERENCES material(id)
);

-- =========================
-- PRODUCT MATERIAL (BOM)
-- =========================
CREATE TABLE product_material (
  id SERIAL PRIMARY KEY,
  product_variation_id INT NOT NULL,
  material_variation_id INT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,

  FOREIGN KEY (product_variation_id) REFERENCES product_variation(id),
  FOREIGN KEY (material_variation_id) REFERENCES material_variation(id)
);

-- =========================
-- PROCESS
-- =========================
CREATE TABLE process (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- =========================
-- PRODUCT PROCESS
-- =========================
CREATE TABLE product_process (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  process_id INT NOT NULL,
  step_order INT,
  estimated_time NUMERIC(10,2),

  FOREIGN KEY (product_id) REFERENCES product(id),
  FOREIGN KEY (process_id) REFERENCES process(id)
);

-- =========================
-- WORKER
-- =========================
CREATE TABLE worker (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- =========================
-- PRODUCTION
-- =========================
CREATE TABLE production (
  id SERIAL PRIMARY KEY,
  order_id INT,

  status VARCHAR(50) CHECK (
    status IN (
      'planejado',
      'aguardando_material',
      'em_andamento',
      'pausado',
      'finalizado',
      'cancelado'
    )
  ),

  start_date TIMESTAMP,
  expected_end_date TIMESTAMP,
  end_date TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES customer_order(id)
);

-- =========================
-- PRODUCTION ITEM
-- =========================
CREATE TABLE production_item (
  id SERIAL PRIMARY KEY,
  production_id INT NOT NULL,
  order_item_id INT,
  product_variation_id INT NOT NULL,

  planned_quantity INT,
  produced_quantity INT DEFAULT 0,

  status VARCHAR(50) CHECK (
    status IN ('pendente','producao','parcial','concluido')
  ),

  FOREIGN KEY (production_id) REFERENCES production(id),
  FOREIGN KEY (order_item_id) REFERENCES order_item(id),
  FOREIGN KEY (product_variation_id) REFERENCES product_variation(id)
);

-- =========================
-- PRODUCTION BATCH
-- =========================
CREATE TABLE production_batch (
  id SERIAL PRIMARY KEY,

  production_id INT NOT NULL,
  process_id INT NOT NULL,

  step_order INT,

  status VARCHAR(50),

  start_date TIMESTAMP,
  end_date TIMESTAMP,

  FOREIGN KEY (production_id) REFERENCES production(id),
  FOREIGN KEY (process_id) REFERENCES process(id)
);

-- =========================
-- BATCH ITEMS
-- =========================
CREATE TABLE production_batch_item (
  id SERIAL PRIMARY KEY,

  production_batch_id INT NOT NULL,
  production_item_id INT NOT NULL,

  quantity INT,

  FOREIGN KEY (production_batch_id) REFERENCES production_batch(id) ON DELETE CASCADE,
  FOREIGN KEY (production_item_id) REFERENCES production_item(id)
);

-- =========================
-- BATCH WORKERS
-- =========================
CREATE TABLE production_batch_worker (
  id SERIAL PRIMARY KEY,

  production_batch_id INT NOT NULL,
  worker_id INT NOT NULL,

  role VARCHAR(50),

  start_date TIMESTAMP,
  end_date TIMESTAMP,

  produced_quantity INT DEFAULT 0,
  worked_time NUMERIC(10,2),

  FOREIGN KEY (production_batch_id) REFERENCES production_batch(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES worker(id)
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_order_customer ON customer_order(customer_id);
CREATE INDEX idx_order_item_order ON order_item(order_id);
CREATE INDEX idx_order_item_variation ON order_item(product_variation_id);

CREATE INDEX idx_production_order ON production(order_id);

CREATE INDEX idx_production_item_production ON production_item(production_id);
CREATE INDEX idx_production_item_status ON production_item(status);

CREATE INDEX idx_product_process_product ON product_process(product_id);

CREATE INDEX idx_batch_production ON production_batch(production_id);
CREATE INDEX idx_batch_process ON production_batch(process_id);

CREATE INDEX idx_batch_item_batch ON production_batch_item(production_batch_id);
CREATE INDEX idx_batch_item_item ON production_batch_item(production_item_id);

CREATE INDEX idx_batch_worker_batch ON production_batch_worker(production_batch_id);
CREATE INDEX idx_batch_worker_worker ON production_batch_worker(worker_id);