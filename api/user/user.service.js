const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
  query,
  getById,
  getByUsername,
  remove,
  update,
  add,
  addMsg,
  addContact,
  removeContact,
  updateMsg,
}
async function query(loggedInUserId) {
  try {
    const collection = await dbService.getCollection('contact')
    var contacts = await collection.find().toArray()
    // const loggedInUser = await collection.findOne({
    //   _id: ObjectId(loggedInUserId),
    // })

    // console.log('loggedInUser:', loggedInUser)
    // console.log('loggedInUser.contacts:', loggedInUser.contacts)

    // const contactsToReturn = contacts.filter((c) =>
    //   loggedInUser.contacts?.map((contact) => contact._id === c._id)
    // )

    // console.log('contactsToReturn:', contactsToReturn)

    return contacts
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}

async function addContact(userId, contactName) {
  const collection = await dbService.getCollection('contact')
  const user = await collection.findOne({ _id: new ObjectId(userId) })

  const contact = await collection.findOne({ username: contactName })

  if (!user.contacts) user.contacts = []

  user.contacts.push(contact)
  await collection.updateOne({ _id: new ObjectId(userId) }, { $set: user })
  return contact
}
async function removeContact(userId, contactId) {
  try {
    const collection = await dbService.getCollection('contact')
    const user = await collection.findOne({ _id: new ObjectId(userId) })
    if (user.contacts) {
      const contactIndex = user.contacts.findIndex(
        (contact) => contact._id.toString() === contactId
      )
      if (contactIndex > -1) {
        user.contacts.splice(contactIndex, 1)
        await collection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: user }
        )
        return true
      }
    }
    return false
  } catch (err) {
    logger.error(
      `Failed to remove contact with id: ${contactId} for user with id: ${userId}`,
      err
    )
    throw err
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection('contact')
    const user = await collection.findOne({ _id: new ObjectId(userId) })
    delete user.password

    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}
async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('contact')
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection('contact')
    await collection.deleteOne({ _id: ObjectId(userId) })
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {
    // peek only updatable properties
    const userToSave = {
      _id: ObjectId(user._id), // needed for the returnd obj
      username: user.username,
      status: user.status,
      img: user.img,
    }
    const collection = await dbService.getCollection('contact')
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
    return userToSave
  } catch (err) {
    logger.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

// async function updateMsg(msgid, senderId) {
//   try {
//     const msg = {
//       _id: ObjectId(user._id), // needed for the returnd obj
//       fullname: user.fullname,
//       score: user.score,
//     }
//     const collection = await dbService.getCollection('contact')
//     await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
//     return userToSave
//   } catch (err) {
//     logger.error(`cannot update user ${user._id}`, err)
//     throw err
//   }
// }

async function updateMsg(msgId, senderId, recipientId) {
  try {
    const collection = await dbService.getCollection('contact')

    const updateMessageContent = async (userId) => {
      const result = await collection.updateOne(
        {
          _id: ObjectId(userId),
          'msgs.id': msgId,
        },
        {
          $set: {
            'msgs.$.content': 'Message deleted',
          },
        }
      )
      return result.modifiedCount
    }

    const senderResult = await updateMessageContent(senderId)
    const recipientResult = await updateMessageContent(recipientId)

    console.log('Sender result modified count:', senderResult)
    console.log('Recipient result modified count:', recipientResult)

    if (senderResult === 1 && recipientResult === 1) {
      return 'Message content updated successfully for both sender and recipient'
    } else {
      throw new Error(
        'Message not found or not updated for either sender or recipient'
      )
    }
  } catch (err) {
    logger.error(
      `Cannot update message with id ${msgId} for senderId ${senderId} and recipientId ${recipientId}`,
      err
    )
    throw err
  }
}

async function add(user) {
  try {
    // peek only updatable fields!
    const userToAdd = {
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      img: user.img,
      status: user.status,
      story: user.story,
      groups: user.groups,
      contacts: user.contacts,
      msgs: user.msgs,
    }
    const collection = await dbService.getCollection('contact')
    await collection.insertOne(userToAdd)
    return userToAdd
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}
async function addMsg(userId, msg) {
  // Check if the message content is empty and return if it is
  if (!msg.content || msg.content.trim() === '') {
    console.log('Message content is empty, ignoring.');
    return;
  }

  const collection = await dbService.getCollection('contact');
  const user = await collection.findOne({ _id: new ObjectId(userId) });

  if (!user.msgs) user.msgs = [];

  // Check if the last message is a duplicate
  const lastMsg = user.msgs[user.msgs.length - 1];
  const isDuplicate = lastMsg &&
    lastMsg.content === msg.content &&
    lastMsg.senderId === msg.senderId &&
    lastMsg.recipientId === msg.recipientId;

  // If it's a duplicate, just return the message without updating the database
  if (isDuplicate) {
    console.log('Duplicate message ignored:', msg.content);
    return msg;
  }

  // Add the msg to the array
  user.msgs.push(msg);

  // Update the user in the database
  await collection.updateOne({ _id: new ObjectId(userId) }, { $set: user });
  return msg;
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullName: txtCriteria,
      },
    ]
  }
  return criteria
}
