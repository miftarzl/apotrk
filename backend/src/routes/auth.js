const express = require('express')
const router = express.Router()
const { login, logout, me, register, updateProfile, changePassword } = require('../controllers/authController')

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', me)
router.put('/profile', updateProfile)
router.post('/change-password', changePassword)
router.post('/register', register)

module.exports = router
