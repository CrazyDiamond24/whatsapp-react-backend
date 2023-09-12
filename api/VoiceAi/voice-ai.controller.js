const { getTextToSpeechURL } = require('./voice-ai.service')

const convertText = async (req, res) => {
  try {
    const { text, voice } = req.body
    const url = await getTextToSpeechURL(text, voice)
    res.json(url)
  } catch (error) {
    console.error('Error in voice-ai.controller:', error)
    res.status(500).send({ error: 'Failed to convert text' })
  }
}

module.exports = { convertText }
