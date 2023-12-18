const { db } = require('../utils/firebase')

const getPostByIdDB = async (postId) => {
  const postDoc = await db.collection('posts').doc(postId).get()

  if (!postDoc.exists) {
    return null
  }

  return {
    id: postDoc.id,
    ...postDoc.data(),
  }
}

module.exports = getPostByIdDB
