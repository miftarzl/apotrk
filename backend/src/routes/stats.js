const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const { stats } = require('../controllers/statsController')

router.get('/', auth, stats)

module.exports = router
