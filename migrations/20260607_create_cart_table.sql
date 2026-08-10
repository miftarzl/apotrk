-- Migration: create cart table

CREATE TABLE IF NOT EXISTS cart (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  medicine_id bigint NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optionally add foreign key constraints if desired (ensure referenced tables exist)
-- ALTER TABLE cart ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id);
-- ALTER TABLE cart ADD CONSTRAINT fk_cart_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id);

-- Trigger to update updated_at on row modification (Postgres example)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON cart;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON cart
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
