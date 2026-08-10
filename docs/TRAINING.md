# Training Recommendation Engine

The system uses TF-IDF + cosine similarity built from medicine textual fields.

To rebuild index after data import:
1. Run background job that fetches all medicines and computes TF-IDF index (server-side) and stores index if necessary.
2. Current implementation computes TF-IDF on-the-fly per request. For high scale, implement precomputed term-document matrix and store in Redis or Supabase table, then load and compute similarity using optimized linear algebra.

Steps to trigger rebuild manually:
- After CSV import, run a script that fetches medicines and serializes the TF-IDF corpus.
