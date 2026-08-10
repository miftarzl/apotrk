-- SQL template to insert admin. Replace <PASSWORD_HASH> with a bcrypt hash.
INSERT INTO profiles (email, password_hash, role) VALUES
('apotekadmin@example.com', '<PASSWORD_HASH>', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;

-- To create the hash automatically, run: `node scripts/seed_admin.js` (requires env SUPABASE_SERVICE_ROLE)
