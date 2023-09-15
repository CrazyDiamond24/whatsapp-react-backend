const express = require('express')
const { convertAudio } = require('./text-ai.controller')
const multer = require('multer')
const upload = multer()

const router = express.Router()
console.log('hi')
router.post('/convert-audio', upload.single('audio'), convertAudio)

module.exports = router
