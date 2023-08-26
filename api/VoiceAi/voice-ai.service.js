const axios = require('axios')
const { Storage } = require('@google-cloud/storage')
require('dotenv').config()

const API_VOICE_URL = 'https://speech.googleapis.com/v1/speech:recognize'
const API_KEY = process.env.GOOGLE_CLOUD_API_KEY
const BUCKET_NAME = 'wuzzappbucket' // replace with your GCS bucket name

const storage = new Storage({
  keyFilename: 'e0ad71e83e887b1185263daa2a9ca8a3b250926f.json',
})

async function generateTextFromVoice(file) {
  const audioData = file.buffer

  const gcsUri = await uploadToGCS(audioData)

  const requestBody = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
    audio: {
      uri: gcsUri,
    },
  }

  try {
    const response = await axios.post(
      `${API_VOICE_URL}?key=${API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      return response.data.results[0].alternatives[0].transcript
    }
    throw new Error('Failed to transcribe voice.')
  } catch (error) {
    console.log('Error:', error) // This
    console.error('Error response from Google API:', error.response.data)
    throw error
  }
}

async function downloadAudio(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer', // This is crucial for binary files like audio
    })
    console.log('Downloaded audio data:', !!response.data)
    return response.data
  } catch (error) {
    console.error('Error downloading audio:', error)
    throw error
  }
}

async function uploadToGCS(audioData) {
  const fileName = `audio-${Date.now()}.opus`
  const bucket = storage.bucket(BUCKET_NAME)
  const file = bucket.file(fileName)

  try {
    await file.save(audioData)
    console.log('Successfully uploaded to GCS.')
    return `gs://${BUCKET_NAME}/${fileName}`
  } catch (error) {
    console.error('Error while uploading to GCS:', error)
    throw error
  }
}

module.exports = {
  generateTextFromVoice,
}
