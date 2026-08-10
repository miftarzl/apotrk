# API Documentation

Base paths (Next.js App Router serverless):

- `GET /api/medicines` — return list of medicines (public)
- `POST /api/recommend` — run recommendation engine; JSON body `{ keluhan, gejala, disease_history, top?, user_id? }`
- `POST /api/import` — admin CSV import; headers: `x-admin-key`; body `{ csv: string }`
- `GET/POST/PUT/DELETE /api/admin/medicines` — admin CRUD for medicines; requires `x-admin-key`

Responses are JSON and status codes follow HTTP semantics.
