const { db } = require('../utils/firebase.js')

const COLLECTION_USER = 'users'

const getUserDocument = async (userId) => {
  const userQuery = await db.collection(COLLECTION_USER).where('uid', '==', userId).get()

  if (userQuery.empty) {
    throw new Error('User not found')
  }

  return userQuery.docs[0]
}

const addPostToCollection = async (postRequest) => {
  const postRef = await db.collection('posts').add(postRequest)
  return { id: postRef.id, ...postRequest }
}

const updateUserPosts = async (userRef, post) => {
  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists) {
        throw new Error('User document not found')
      }

      const updatedUserData = {
        posts: [...(userDoc.data()?.posts || []), post.id],
      }

      transaction.update(userRef, updatedUserData)
    })
  } catch (error) {
    // Handle transaction error
    throw new Error(`Error updating user document: ${error.message}`)
  }
}

// get user document by userId
const getUserDocByUid = async (id) => {
  try {
    const userRef = db.collection(COLLECTION_USER).where('uid', '==', id)
    const userQuerySnapshot = await userRef.get()

    if (userQuerySnapshot.empty) {
      return null // User not found
    }

    // Ambil data pengguna dari hasil query
    const userData = userQuerySnapshot.docs[0].data()

    return {
      id: userQuerySnapshot.docs[0].id,
      ...userData,
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = {
  getUserDocument,
  addPostToCollection,
  updateUserPosts,
  getUserDocByUid,
}
