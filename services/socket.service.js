const logger = require('./logger.service')
const userService = require('../api/user/user.service')
let gIo = null
let SOCKET_EVENT_USER_UPDATED = 'user-updated'
let SOCKET_EVENT_USER_UPDATED_ADDED_STORY = 'user-updated-added-story'

function setupSocketAPI(http) {
  gIo = require('socket.io')(http, {
    cors: {
      origin: '*',
    },
  })
  gIo.on('connection', (socket) => {
    logger.info(`New connected socket [id: ${socket.id}]`)
    socket.on('disconnect', async () => {
      const userId = socket.userId
      if (userId) {
        await userService.updateUser(userId, {
          isOnline: false,
          lastSeen: Date.now(),
        })
        gIo.emit(SOCKET_EVENT_USER_UPDATED, {
          userId,
          isOnline: false,
          lastSeen: Date.now(),
        })
        logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
        delete socket.userId
      }
    })

    socket.on('typing', ({ senderId, recipientId, isTyping }) => {
      if (senderId && recipientId) {
        socket.broadcast
          .to(recipientId)
          .emit('user-typing', { userId: senderId, isTyping })
      }
    })
    socket.on('user-block-status-updated', (data) => {
      const { blockedUserId, action } = data
      logger.info(`User ${blockedUserId} is ${action}`)
      // Emit the event to all sockets except the affected user
      broadcast({
        type: 'user-block-status-updated',
        data: { blockedUserId, action },
        userId: blockedUserId,
      })
    })
    socket.on('user-watch', (userId) => {
      logger.info(
        `user-watch from socket [id: ${socket.id}], on user ${userId}`
      )
      socket.join('watching:' + userId)
      logger.info(`Joined room: watching:${userId}`)
    })
    socket.on('recording', ({ senderId, recipientId, isRecording }) => {
      if (senderId && recipientId) {
        socket.broadcast
          .to(recipientId)
          .emit('user-recording', { userId: senderId, isRecording })
      }
    })
    socket.on('chat-send-msg', async (msg) => {
      logger.info(
        `New chat msg from socket [id: ${socket.id}], emitting to recipient`
      )
      logger.debug('Received message:', msg)

      emitToUser({
        type: 'chat-add-msg',
        data: msg,
        userId: msg.recipientId,
      })

      emitToUser({
        type: 'chat-add-msg',
        data: msg,
        userId: msg.senderId,
      })
    })

    socket.on('user-watch', (userId) => {
      logger.info(
        `user-watch from socket [id: ${socket.id}], on user ${userId}`
      )
      socket.join('watching:' + userId)
      logger.info(`Joined room: watching:${userId}`)
    })
    socket.on('set-user-socket', async (userId) => {
      logger.debug('userid in set user socket', userId)
      logger.info(
        `Setting socket.userId = ${userId} for socket [id: ${socket.id}]`
      )
      socket.join(userId)
      socket.userId = userId
      await userService.updateUser(userId, {
        isOnline: true,
        lastSeen: Date.now(),
      })

      gIo.emit(SOCKET_EVENT_USER_UPDATED, {
        userId,
        isOnline: true,
        lastSeen: Date.now(),
      })
    })
    socket.on('added-story-socket', async (userId) => {
      logger.debug('userid in set user socket', userId)
      logger.info(
        `Setting socket.userId = ${userId} for socket [id: ${socket.id}]`
      )
      socket.join(userId)
      socket.userId = userId
      await userService.updateUser(userId, {
        haveStory: true,
      })

      gIo.emit(SOCKET_EVENT_USER_UPDATED_ADDED_STORY, {
        userId,
        haveStory: true,
      })
    })
    socket.on('unset-user-socket', async () => {
      const userId = socket.userId
      if (userId) {
        const updatedUser = await userService.updateUser(userId, {
          isOnline: false,
          lastSeen: Date.now(),
        })
        gIo.emit(SOCKET_EVENT_USER_UPDATED, {
          updatedUser,
        })
        logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
        delete socket.userId
      }
    })
  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to('watching:' + label.toString()).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  userId = userId.toString()
  const socket = await _getUserSocket(userId)

  if (socket) {
    logger.info(
      `Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
    )
    socket.emit(type, data)
  } else {
    logger.info(`No active socket for user: ${userId}`)
    // _printSockets()
  }
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
  userId = userId.toString()

  logger.info(`Broadcasting event: ${type}`)
  const excludedSocket = await _getUserSocket(userId)
  if (room && excludedSocket) {
    logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
    excludedSocket.broadcast.to(room).emit(type, data)
  } else if (excludedSocket) {
    logger.info(`Broadcast to all excluding user: ${userId}`)
    excludedSocket.broadcast.emit(type, data)
  } else if (room) {
    logger.info(`Emit to room: ${room}`)
    gIo.to(room).emit(type, data)
  } else {
    logger.info(`Emit to all`)
    gIo.emit(type, data)
  }
}

async function _getUserSocket(userId) {
  const sockets = await _getAllSockets()
  const socket = sockets.find((s) => s.userId === userId)
  return socket
}
async function _getAllSockets() {
  // return all Socket instances
  const sockets = await gIo.fetchSockets()
  return sockets
}


function _printSocket(socket) {
  console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
  // set up the sockets service and define the API
  setupSocketAPI,
  // emit to everyone / everyone in a specific room (label)
  emitTo,
  // emit to a specific user (if currently active in system)
  emitToUser,
  // Send to all sockets BUT not the current socket - if found
  // (otherwise broadcast to a room / to all)
  broadcast,
}
