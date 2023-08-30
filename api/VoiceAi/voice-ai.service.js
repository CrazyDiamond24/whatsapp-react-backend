require('dotenv').config()
const cloudinary = require('cloudinary').v2
const DatauriParser = require('datauri/parser')
const parser = new DatauriParser()

cloudinary.config({
  cloud_name: process.env.VITE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function getTextToSpeechURL(msg) {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        method: 'POST',
        headers: {
          accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.TEXT_TO_SPEECH_API_KEY,
        },
        body: JSON.stringify({
          text: msg,
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Something went wrong')
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const file = Math.random().toString(36).substring(7)
    const dataUri = parser.format('.mp3', buffer)

    const cloudinaryResponse = await cloudinary.uploader.upload(
      dataUri.content,
      {
        resource_type: 'video',
        public_id: `UserAudio/${file}.mp3`,
        upload_preset: process.env.REACT_APP_VITE_UPLOAD_PRESET,
      }
    )

    if (cloudinaryResponse && cloudinaryResponse.url) {
      return { file: cloudinaryResponse.url }
    } else {
      throw new Error('Failed to upload to Cloudinary')
    }
  } catch (error) {
    console.error('API Request Error:', error)
  }
}

module.exports = { getTextToSpeechURL }
