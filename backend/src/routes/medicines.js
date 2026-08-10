const express = require('express')
const router = express.Router()
const { list, popular, getById, create, update, remove } = require('../controllers/medicinesController')
const auth = require('../middleware/authMiddleware')

// Public list endpoint
router.get('/', list)
// Public detail endpoint
router.get('/popular', popular)
router.get('/:id', getById)
router.post('/', auth, create)
router.put('/:id', auth, update)
router.delete('/:id', auth, remove)

module.exports = router
