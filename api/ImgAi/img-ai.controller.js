const openaiService = require('./img-ai.service')

async function generateImage(req, res) {
  try {
    const { prompt } = req.body
    console.log('prompt', prompt)
    const url = await openaiService.generateImageFromText(prompt)
    res.send(url)
  } catch (error) {
    console.error(`Error generating image: ${error}`)
    res.status(500).send({ error: 'Failed to generate image' })
  }
}

module.exports = {
  generateImage,
}
