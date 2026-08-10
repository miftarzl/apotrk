# ERD (Entity Relationship Diagram)

Tables:
- `profiles` (id PK, name, role, created_at)
- `categories` (id PK, name, description)
- `medicines` (id PK, name, category_id FK -> categories.id, indication, symptoms, disease_history, description, dosage_form, stock, price, image_url)
- `recommendation_history` (id PK, user_id FK -> auth.users.id, query, result JSONB, similarity_score, created_at)
- `favorites` (id PK, user_id FK, medicine_id FK)

Create ERD diagram using any tool (dbdiagram.io) with above relations.
