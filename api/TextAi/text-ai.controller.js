const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const { processAudio } = require('./text-ai.service')

async function convertAudio(req, res) {
  try {
<<<<<<< HEAD
    console.log('hi')
    // console.log('FormData:', formData);
    console.log('req.file.buffer', req.file.buffer)
    const audioFile = req.file.buffer
    console.log('audioFile received')
=======
    const audioFile = req.body
>>>>>>> 1ff2e57a3d083307d70fda132dec577c453a31fc
    const text = await processAudio(audioFile)
    res.json({ text: text })
  } catch (error) {
    console.error('Error in text-ai.controller:', error)
    res.status(500).send({ error: 'Failed to convert audio to text' })
  }
}

module.exports = { convertAudio }
