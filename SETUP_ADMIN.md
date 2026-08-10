# Create Admin User in Supabase

Use the Supabase SQL Editor or the Admin API with your `SUPABASE_SERVICE_ROLE` to create an admin user and set role in `profiles`.

SQL example (run in SQL Editor):

```sql
-- replace email and password via service role or use Supabase Auth UI
-- create user via Admin API or Dashboard then set profile role
update profiles set role = 'admin' where id = '<user-uuid>';

-- or insert
insert into profiles (id, name, role) values ('<user-uuid>','Admin User','admin');
```

To get a user's `id`, create the user via Supabase Auth (email signup), then check `auth.users` table or `profiles`.

For testing locally you can:
1. Create user via Supabase Auth > Users in Dashboard.
2. Copy the user's `id` and run the SQL above to set `role='admin'`.

Default admin credentials (recommended to create manually):
- Email: admin@example.com
- Password: Use secure password; create user via Supabase Auth UI then set `profiles.role='admin'`.
