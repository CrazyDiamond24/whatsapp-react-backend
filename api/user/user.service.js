const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId

module.exports = {
  query,
  getById,
  getByUsername,
  remove,
  update,
  add,
  addMessage,
  addContact,
  updateMessage,
}
async function query(loggedInUserId) {
  try {
    const collection = await dbService.getCollection("contact")
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
    logger.error("cannot find users", err)
    throw err
  }
}

async function addContact(userId, contactName) {
  const collection = await dbService.getCollection("contact")
  const user = await collection.findOne({ _id: new ObjectId(userId) })

  const contact = await collection.findOne({ username: contactName })

  if (!user.contacts) user.contacts = []

  // Add the message to the array
  user.contacts.push(contact)
  await collection.updateOne({ _id: new ObjectId(userId) }, { $set: user })
  return contact
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection("contact")
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
    const collection = await dbService.getCollection("contact")
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection("contact")
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
      fullname: user.fullname,
      score: user.score,
    }
    const collection = await dbService.getCollection("contact")
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

async function updateMessage(msgId, senderId) {
  try {
    const collection = await dbService.getCollection("contact")
    const result = await collection.updateOne(
      {
        _id: ObjectId(senderId),
        "msgs.id": msgId,
      },
      {
        $set: {
          "msgs.$.content": "Messege deleted",
        },
      }
    )
    console.log(result.modifiedCount)

    if (result.modifiedCount === 1) {
      return "Message content updated successfully"
    } else {
      throw new Error("Message not found or not updated")
    }
  } catch (err) {
    logger.error(
      `Cannot update message with _id ${msgId} for senderId ${senderId}`,
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
    const collection = await dbService.getCollection("contact")
    await collection.insertOne(userToAdd)
    return userToAdd
  } catch (err) {
    logger.error("cannot add user", err)
    throw err
  }
}
async function addMessage(userId, message) {
  const collection = await dbService.getCollection("contact")
  const user = await collection.findOne({ _id: new ObjectId(userId) })

  // Ensure the user has a msgs array
  if (!user.msgs) user.msgs = []

  // Add the message to the array
  user.msgs.push(message)

  // Update the user in the database
  await collection.updateOne({ _id: new ObjectId(userId) }, { $set: user })
  return message
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" }
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
