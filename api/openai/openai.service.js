const { Configuration, OpenAIApi } = require('openai')
const readlineSync = require('readline-sync')

async function startChat() {
  const configuration = new Configuration({
    apiKey: 'Your secret key',
  })

  const openai = new OpenAIApi(configuration)

  const messages = []

  while (true) {
    const user_input = readlineSync.question('Your input : ')
    messages.push({ role: 'user', content: user_input })
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
    })

    let reply = response.data.choices[0].message.content
    console.log(reply)
    messages.push({ role: 'user', content: reply })
  }
}

startChat()
