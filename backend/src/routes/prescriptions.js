const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const { list, create, remove, detail } = require('../controllers/prescriptionsController')

router.get('/', auth, list)
router.get('/:id', auth, detail)
router.post('/', auth, create)
router.delete('/:id', auth, remove)

module.exports = router
