const express = require('express')
const { convertAudio } = require('./text-ai.controller')
const router = express.Router()

router.post('/convert-audio', convertAudio)

module.exports = router
