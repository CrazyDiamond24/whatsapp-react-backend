const express = require('express')
const { generateText } = require('./voice-ai.controller')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const router = express.Router()

router.post('/generate-text', upload.single('audio'), generateText)

module.exports = router
