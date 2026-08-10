const path = require('path')
// Load backend .env first (when running from backend folder)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Require root-level seed script
require(path.join(__dirname, '..', '..', 'scripts', 'seed_admin.js'))
