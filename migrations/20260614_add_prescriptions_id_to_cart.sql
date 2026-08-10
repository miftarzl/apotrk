-- Migration: add prescriptions_id to cart

ALTER TABLE cart
  ADD COLUMN IF NOT EXISTS prescriptions_id bigint;

-- Optional FK constraint (uncomment if you want enforced referential integrity)
-- ALTER TABLE cart ADD CONSTRAINT fk_cart_prescription FOREIGN KEY (prescriptions_id) REFERENCES prescriptions(id) ON DELETE SET NULL;
