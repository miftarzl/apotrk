# Deployment Guide

1. Create Supabase project and run `supabase_schema.sql` in SQL Editor.
2. Create Storage buckets as in `SUPABASE_STORAGE_SETUP.md`.
3. Push repository to GitHub.
4. On Vercel, import the GitHub repo and set environment variables for the project:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `ADMIN_API_KEY`
   - For frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
5. Deploy frontend on Vercel (App Router + API routes will serve serverless functions).
