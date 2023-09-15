const openaiService = require('./openai.service')
const logger = require('../../services/logger.service')

async function askGpt(req, res) {
  try {
    const { prompt, character } = req.body
    console.log('character', character)
    const reply = await openaiService.ask(prompt, character)
    res.send(reply)
  } catch (err) {
    logger.error('Failed to get user', err)
    res.status(500).send({ err: 'Failed to get user' })
  }
}

module.exports = {
  askGpt,
}
