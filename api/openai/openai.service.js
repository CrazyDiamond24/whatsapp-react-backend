const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
module.exports = {
  ask,
}

const { Configuration, OpenAIApi } = require('openai')
// const readlineSync = require('readline-sync')
// require('dotenv').config()

async function ask(msg) {
  try {
    const configuration = new Configuration({
      // apiKey: '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', // Use environment variable for security
      apiKey: process.env.REACT_APP_CHAT_GPT_API_KEY, // Use environment variable for security
    })

    const openai = new OpenAIApi(configuration)

    const messages = [
      {
        role: 'system',
        content: 'You are an intelligent system.',
      },
      { role: 'user', content: msg.prompt },
    ]

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    })

    let reply = response.data.choices[0].message.content
    console.log('reply', reply)
    return reply
  } catch (error) {
    console.error(
      'Error in OpenAI service:',
      error.response ? error.response.data.error : error
    )
    // logger.error(...)  // You can keep this if you have a logging system in place
  }
}
