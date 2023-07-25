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
  addMsg,
  addContact,
  removeContact,
  updateMsg,
} = require('./user.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/:id/msg', addMsg)
router.put('/msg/edit', updateMsg)
router.put('/:id', requireAuth, updateUser)
router.delete('/:id', requireAuth, deleteUser)
router.post('/:id/add-contact', addContact)
router.delete('/:id/remove-contact/:contactId', removeContact)
// router.put('/:id',  requireAuth, updateUser)
// router.delete('/:id',  requireAuth, requireAdmin, deleteUser)

module.exports = router
