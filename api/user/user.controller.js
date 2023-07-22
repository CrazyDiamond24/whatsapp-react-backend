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
async function addMessage(req, res) {
  try {
    const userId = req.params.id
    const message = req.body
    const addedMessage = await userService.addMessage(userId, message)
    res.send(addedMessage)
  } catch (err) {
    logger.error('Failed to add message', err)
    res.status(500).send({ err: 'Failed to add message' })
  }
}
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

module.exports = {
  getUser,
  getUsers,
  addMessage,
  deleteUser,
  updateUser,
  addContact,
}
