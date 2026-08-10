const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const auth = require('../middleware/authMiddleware')
const { uploadImage } = require('../controllers/uploadController')

router.post('/', auth, upload.single('file'), uploadImage)

module.exports = router
