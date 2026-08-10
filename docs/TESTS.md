# Testing

Unit tests:
- Backend: `node test_recommender.js` (simple smoke tests)
- Frontend: `npm run test` (vitest) in `frontend/`

E2E tests (Playwright):
- `npm run e2e` in `frontend/` (ensure frontend and backend running)

CI: GitHub Actions workflow `.github/workflows/main.yml` runs tests and e2e on pushes and PRs.
