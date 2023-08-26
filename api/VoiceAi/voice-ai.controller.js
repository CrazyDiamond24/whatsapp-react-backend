const voiceaiService = require('./voice-ai.service')

async function generateText(req, res) {
  console.log('req.file', req.file)
  try {
    const text = await voiceaiService.generateTextFromVoice(req.file)
    res.send(text)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = {
  generateText, // Updated here
}
