const express = require('express')
const {
  requireAuth,
  requireAdmin,
} = require('../../middlewares/requireAuth.middleware')
const {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  addMessage,
  addContact,
  removeContact,
  updateMessage,
} = require('./user.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/:id/message', addMessage)
router.put('/:id/message', updateMessage)
router.put('/:id', updateUser)
router.delete('/:id', requireAuth, deleteUser)
router.post('/:id/add-contact', addContact)
router.delete('/:id/remove-contact/:contactId', removeContact)
// router.put('/:id',  requireAuth, updateUser)
// router.delete('/:id',  requireAuth, requireAdmin, deleteUser)

module.exports = router
