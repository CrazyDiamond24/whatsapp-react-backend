const openaiService = require('./openai.service')
const logger = require('../../services/logger.service')

async function askGpt(req, res) {
  try {
    const msg = req.body
    console.log('prompt in req', msg)
    const reply = await openaiService.ask(msg)
    res.send(reply)
  } catch (err) {
    logger.error('Failed to get user', err)
    res.status(500).send({ err: 'Failed to get user' })
  }
}
module.exports = {
  askGpt,
}
