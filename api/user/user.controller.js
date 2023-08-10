const userService = require('./user.service')
const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')

async function getUser(req, res) {
  try {
    const user = await userService.getById(req.params.id)
    res.send(user)
  } catch (err) {
    logger.error('Failed to get user', err)
    res.status(500).send({ err: 'Failed to get user' })
  }
}

async function getUsers(req, res) {
  try {
    const users = await userService.query()
    res.send(users)
  } catch (err) {
    logger.error('Failed to get users', err)
    res.status(500).send({ err: 'Failed to get users' })
  }
}

async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    logger.error('Failed to delete user', err)
    res.status(500).send({ err: 'Failed to delete user' })
  }
}

async function updateUser(req, res) {
  try {
    const user = req.body
    const savedUser = await userService.update(user)
    res.send(savedUser)
  } catch (err) {
    logger.error('Failed to update user', err)
    res.status(500).send({ err: 'Failed to update user' })
  }
}
async function updateUserLatSeen(req, res) {
  try {
    const user = req.body
    const savedUser = await userService.updateLastSeen(user)
    res.send(savedUser)
  } catch (err) {
    logger.error('Failed to update user', err)
    res.status(500).send({ err: 'Failed to update user' })
  }
}
async function blockUnBlock(req, res) {
  try {
    const {actionType, loggedInUserId} = req.body
    const userId = req.params.id
    const savedUser = await userService.blockUnBlockUser(userId , actionType , loggedInUserId)
    res.send(savedUser)
  } catch (err) {
    logger.error('Failed to update user', err)
    res.status(500).send({ err: 'Failed to update user' })
  }
}
async function updatePref(req, res) {
  try {
    const user = req.body
    const savedUser = await userService.updateUserPref(user)
    res.send(savedUser)
  } catch (err) {
    logger.error('Failed to update user', err)
    res.status(500).send({ err: 'Failed to update user' })
  }
}
async function addMsg(req, res) {
  try {
    const userId = req.params.id
    const msg = req.body
    // console.log('**********userId controller ********', userId)
    const addedMsg = await userService.addMsg(userId, msg)
    res.send(addedMsg)
  } catch (err) {
    logger.error('Failed to add message', err)
    res.status(500).send({ err: 'Failed to add message' })
  }
}

async function updateMsg(req, res) {
  try {
    const { msgId, senderId, recipientId } = req.body
    await userService.updateMsg(msgId, senderId, recipientId)
    res.send({ msg: 'message updated successfully' })
  } catch (err) {
    logger.error('Failed to update message', err)
    res.status(500).send({ err: 'Failed to update message' })
  }
}

// backend controller
async function getUserMessages(req, res) {
  try {
    const { userId, loggedInUserId } = req.params

    // Fetch the user messages from the database
    const messages = await msgService.getUserMessages(userId, loggedInUserId)

    res.status(200).json(messages)
  } catch (err) {
    logger.error('Failed to get user messages', err)
    res.status(500).send({ err: 'Failed to get user messages' })
  }
}

// ... other controller functions ...

async function addContact(req, res) {
  try {
    const userId = req.params.id
    const contactName = req.body.contactName
    const contact = await userService.addContact(userId, contactName)
    res.send(contact)
  } catch (err) {
    logger.error('Failed to add contact', err)
    res.status(500).send({ err: 'Failed to add contact' })
  }
}
async function addStory(req, res) {
  try {
    const userId = req.params.id
    const url = req.body.url
    const imgUrl = await userService.addStory(userId, url)
    res.send(imgUrl)
  } catch (err) {
    logger.error('Failed to add contact', err)
    res.status(500).send({ err: 'Failed to add contact' })
  }
}
async function removeContact(req, res) {
  const { id, contactId } = req.params
  try {
    await userService.removeContact(id, contactId)
    res.status(200).end()
  } catch (error) {
    res.status(500).send({ error: 'failed to remove contact' })
  }
}

module.exports = {
  getUser,
  getUsers,
  addMsg,
  deleteUser,
  updateUser,
  addContact,
  removeContact,
  updateMsg,
  getUserMessages,
  addStory,
  updatePref,
  updateUserLatSeen,
  blockUnBlock,
}
