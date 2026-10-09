-- DineDesk database schema
-- running this file wipes existing data, so only use it for setup / reset

DROP TABLE IF EXISTS order_items, orders, reservations, restaurant_tables, menu_items, categories, users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash TEXT         NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'kitchen', 'admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id           SERIAL PRIMARY KEY,
  category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  name         VARCHAR(100)  NOT NULL,
  description  TEXT,
  price        NUMERIC(8, 2) NOT NULL CHECK (price > 0),
  is_veg       BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurant_tables (
  id           SERIAL PRIMARY KEY,
  table_number INT NOT NULL UNIQUE,
  seats        INT NOT NULL CHECK (seats > 0)
);

CREATE TABLE orders (
  id             SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES users(id),
  order_type     VARCHAR(10) NOT NULL CHECK (order_type IN ('dine-in', 'takeaway')),
  table_number   INT,
  status         VARCHAR(12) NOT NULL DEFAULT 'placed'
                 CHECK (status IN ('placed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('card', 'cash')),
  payment_status VARCHAR(10) NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending', 'paid')),
  subtotal       NUMERIC(10, 2) NOT NULL,
  tax            NUMERIC(10, 2) NOT NULL,
  total          NUMERIC(10, 2) NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL,
  name         VARCHAR(100)  NOT NULL,
  price        NUMERIC(8, 2) NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE reservations (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id),
  table_id         INT NOT NULL REFERENCES restaurant_tables(id),
  guest_name       VARCHAR(80) NOT NULL,
  phone            VARCHAR(20) NOT NULL,
  party_size       INT NOT NULL CHECK (party_size > 0),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status           VARCHAR(10) NOT NULL DEFAULT 'confirmed'
                   CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  special_request  TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reservations_slot ON reservations(reservation_date, reservation_time);
