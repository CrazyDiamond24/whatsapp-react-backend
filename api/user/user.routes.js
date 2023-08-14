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
  addStory,
  updatePref,
  updateUserLatSeen,
  blockUnBlock,
  clearChat,
} = require('./user.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.post('/:id/add-contact', addContact)
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/:id/msg', addMsg)
router.put('/msg/edit', updateMsg)
router.put('/:id', updateUser)
router.post('/clear-chat', clearChat)
router.put('/:id/last-seen', updateUserLatSeen)
router.put('/:id/block-un-block', blockUnBlock)
router.put('/:id/pref', updatePref)
router.delete('/:id', requireAuth, deleteUser)
router.post('/:id/add-story', addStory)

router.delete('/:id/remove-contact/:contactId', removeContact)
// router.put('/:id',  requireAuth, updateUser)
// router.delete('/:id',  requireAuth, requireAdmin, deleteUser)

module.exports = router
