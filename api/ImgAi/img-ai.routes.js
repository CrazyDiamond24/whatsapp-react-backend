const express = require('express')
const { generateImage } = require('./img-ai.controller')
const router = express.Router()

router.post('/generate-image', generateImage)

module.exports = router
