# Supabase Storage Setup

1. Create buckets in Supabase Storage:
   - `images` (public or protected)
   - `csv-dataset` (private, for uploaded CSV files)

2. Public access config:
   - For `images`, set public access if you want images directly served.
   - For `csv-dataset`, keep private and generate signed URLs when needed.

3. Example RLS policy snippets (SQL Editor):

-- Allow authenticated users to insert into recommendation_history
-- Replace `your_schema` with `public` if needed
-- Example: allow insert when user is authenticated
```
-- enable row level security on recommendation_history;
-- create policy "Insert own history" on recommendation_history for insert using (auth.role() = 'authenticated');
```

4. Supabase Storage via CLI (optional):
   - Use `supabase` CLI to create buckets programmatically.

5. In frontend, use `supabase.storage.from('images').upload(path, file)` to upload images. For server-side imports, use `supabase.storage.from('csv-dataset').upload(path, file)` with the `SUPABASE_SERVICE_ROLE` key.
