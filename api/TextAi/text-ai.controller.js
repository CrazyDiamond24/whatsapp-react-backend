const { processAudio } = require('./text-ai.service')

const convertAudio = async (req, res) => {
  try {
    const audioFile = req.body
    const text = await processAudio(audioFile)
    res.json({ text: text })
  } catch (error) {
    console.error('Error in voice-ai.controller:', error)
    res.status(500).send({ error: 'Failed to convert audio to text' })
  }
}

module.exports = { convertAudio }
