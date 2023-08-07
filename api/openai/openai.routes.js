const express = require('express')
const {
  requireAuth,
  requireAdmin,
} = require('../../middlewares/requireAuth.middleware')
const { askGpt } = require('./openai.controller')
const router = express.Router()

router.post('/ask', askGpt)

module.exports = router
