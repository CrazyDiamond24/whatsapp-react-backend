const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const cron = require('node-cron')
const moment = require('moment')
const dbService = require('./services/db.service')
const { ObjectId } = require('mongodb')

const app = express()
const http = require('http').createServer(app)

app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  const corsOptions = {
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const openaiRoutes = require('./api/openai/openai.routes')
const imgAiRoutes = require('./api/ImgAi/img-ai.routes')
// const textAi = require('./api/TextAi/text-ai.routes')

const voiceAiRoutes = require('./api/VoiceAi/voice-ai.routes')

const { setupSocketAPI } = require('./services/socket.service')

const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/contact', userRoutes)
app.use('/api/openai', openaiRoutes)
app.use('/api/ImgAi', imgAiRoutes)
// app.use('/api/TextAi', textAi)
app.use('/api/VoiceAi', voiceAiRoutes)

setupSocketAPI(http)

cron.schedule('0 * * * *', async () => {
  const collection = await dbService.getCollection('contact')
  const users = await collection.find().toArray()

  users.forEach(async (user) => {
    if (user.fullName === 'gpt') return

    if (user?.story?.length > 0) {
      user.story = user.story.filter((story) => {
        const storyAgeInHours = moment
          .duration(moment().diff(story.createdAt))
          .asHours()
        return storyAgeInHours <= 24
      })
      if (user.story.length === 0) {
        user.haveStory = false
      }

      await collection.updateOne({ _id: ObjectId(user._id) }, { $set: user })
    }
  })
})

app.get('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const logger = require('./services/logger.service')
const port = process.env.PORT || 3030
http.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})
