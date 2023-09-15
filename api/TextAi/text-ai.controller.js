const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const { processAudio } = require('./text-ai.service')

async function convertAudio(req, res) {
  try {
    console.log('hi')
    // console.log('FormData:', formData);
    console.log('req.file.buffer', req.file.buffer)
    const audioFile = req.file.buffer
    console.log('audioFile received')
    const text = await processAudio(audioFile)
    res.json({ text: text })
  } catch (error) {
    console.error('Error in text-ai.controller:', error)
    res.status(500).send({ error: 'Failed to convert audio to text' })
  }
}

module.exports = { convertAudio }
