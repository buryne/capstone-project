const { db } = require('../utils/firebase.js')

const collection = 'users'

const getUserDocument = async (userId) => {
  const userQuery = await db.collection(collection).where('uid', '==', userId).get()

  if (userQuery.empty) {
    throw new Error('User not found')
  }

  return userQuery.docs[0]
}

const addPostToCollection = async (postRequest) => {
  const postRef = await db.collection('posts').add(postRequest)
  return { id: postRef.id, ...postRequest }
}

const updateUserPosts = async (userRef, userDoc, post) => {
  const updatedUserData = {
    posts: [...userDoc.data().posts, post.id],
  }

  await userRef.update(updatedUserData)
}

module.exports = {
  getUserDocument,
  addPostToCollection,
  updateUserPosts,
}
