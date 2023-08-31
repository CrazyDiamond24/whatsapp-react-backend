require('dotenv').config()

async function processAudio(audioBuffer) {
  try {
    const formData = new FormData()
    formData.append('audio', audioBuffer)

    const response = await fetch(
      'https://api.openai.com/v1/whisper/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CHAT_GPT_API_KEY}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('API Request Error')
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

module.exports = { processAudio }
