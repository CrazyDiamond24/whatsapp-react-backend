const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const cron = require('node-cron')
const moment = require('moment')
const dbService = require('./services/db.service')
const { ObjectId } = require('mongodb') // Make sure this matches your MongoDB setup.

const app = express()
const http = require('http').createServer(app)

// Express App Config
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
const { setupSocketAPI } = require('./services/socket.service')

// routes
const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/contact', userRoutes)
setupSocketAPI(http)

// Setup cron job to remove story URLs after 24 hours
cron.schedule('0 * * * *', async () => {
  // Runs every hour
  const collection = await dbService.getCollection('contact')
  const users = await collection.find().toArray()

  users.forEach(async (user) => {
    if (user.story && user.story.length) {
      user.story = user.story.filter((story) => {
        const storyAgeInHours = moment
          .duration(moment().diff(story.createdAt))
          .asHours()
        return storyAgeInHours <= 24
      })

      await collection.updateOne({ _id: ObjectId(user._id) }, { $set: user })
    }
  })
})

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const logger = require('./services/logger.service')
const port = process.env.PORT || 3030
http.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})
