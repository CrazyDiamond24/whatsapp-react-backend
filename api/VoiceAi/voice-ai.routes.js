const express = require('express')
const { convertText } = require('./voice-ai.controller')
const router = express.Router()

router.post('/convert-text', convertText)

module.exports = router
