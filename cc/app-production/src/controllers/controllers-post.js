const asyncHandler = require('express-async-handler')
const validatePost = require('../schema/validate-post.js')
const uploadFileToStorage = require('../utils/upload-file-to-storage.js')
const { db, firebase, storage } = require('../utils/firebase.js')
const {
  getUserDocument,
  addPostToCollection,
  updateUserPosts,
} = require('../services/user-action.js')
const getTimestamp = require('../utils/timestamp.js')
const getPostByIdDB = require('../services/post-action.js')

const COLLECTION_USER = 'users'
const COLLECTION_POST = 'posts'

// * API to create post
const createPost = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.uid
    console.log('userId', userId)
    const postData = req.body
    const file = req.file

    const downloadURL = await uploadFileToStorage(file)
    const timestamp = getTimestamp()

    const tags = req.body.tags ? req.body.tags.split(',').map((tag) => tag.trim()) : []

    const postRequest = {
      userId,
      ...postData,
      tags,
      image: downloadURL,
      create_at: timestamp,
      update_at: timestamp,
    }

    await validatePost(postRequest)


    const userDoc = await getUserDocument(userId)

    if (userDoc) {
      const userRef = db.collection(COLLECTION_USER).doc(userDoc.id)
      const validatedPost = await addPostToCollection(postRequest)
      await updateUserPosts(userRef, validatedPost)

      const postResult = {
        id: validatedPost.id,
        ...validatedPost,
      }

      res.status(200).json({ postId: validatedPost.id, data: postResult })
    }
  } catch (error) {
    res.status(500).json({ message: 'Something Error', error: error.message })
  }
})

// * API to get all post
const getAllPosts = asyncHandler(async (req, res) => {
  try {
    console.log(req.headers.authorization)
    const postsSnapshot = await db.collection(COLLECTION_POST).get()
    const postsData = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch user data for each post
    const postsWithUserData = await Promise.all(
      postsData.map(async (post) => {
        // Fetch user data based on userId
        // console.log('post', post.userId)
        const uid = post.userId
        const userSnapshot = await db.collection(COLLECTION_USER).where('uid', '==', uid).get()

        // Check if userSnapshot is not empty
        if (userSnapshot.empty) {
          console.log('User not found for post with userId:', uid)
          return post // Return the post without user data
        }

        // Assume there's only one document in the snapshot
        const userData = userSnapshot.docs[0].data()

        const user = {
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
        }

        // Combine post data with user data (excluding userId)
        const postWithUserData = {
          ...post,
          ...user,
        }

        // Remove userId property if it's present
        delete postWithUserData.userId

        return postWithUserData
      }),
    )

    const resultsQuery = postsWithUserData.filter((post) => {
      // eslint-disable-next-line operator-linebreak
      const titleMatch =
        post.title.toLowerCase().includes(req.query.title || '') ||
        post.title.includes(req.query.title || '')
      const locationMatch = post.location.toLowerCase().includes(req.query.location || '')

      const tagsMatch = post.tags.some((tag) => {
        return tag.includes(req.query.tags || '')
      })

      return titleMatch && locationMatch && tagsMatch
    })

    if (postsWithUserData.length === 0) {
      return res.status(404).json({
        message: 'No Posts Found',
      })
    }

    res.status(200).json({
      message: 'Success',
      allData: postsWithUserData.length,
      count: resultsQuery.length,
      data: resultsQuery,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// * API to get by id a post
const getPostById = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id
    const post = await getPostByIdDB(postId)

    if (!post) {
      return res.status(404).json({ message: `Post not found ${postId}` })
    }

    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// * API to update a post
const updatePostById = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id
    const post = await getPostByIdDB(postId)

    if (!post || post.userId !== req.user.uid) {
      return res.status(403).json({ error: 'You do not have permission to edit this post.' })
    }

    const updatedAt = firebase.firestore.Timestamp.fromDate(new Date())
    // Default to the existing image URL
    let imageUrl = post.image

    if (req.file) {
      if (post.image) {
        const previousFileName = post.image.split('/').pop()
        const previousFileRef = storage.file('images/' + previousFileName)
        await previousFileRef.delete()
      }
      const file = req.file
      imageUrl = await uploadFileToStorage(file)

      console.log('New Image URL:', imageUrl)
    }

    const updatedPostData = {
      title: req.body.title,
      caption: req.body.caption,
      location: req.body.location,
      tags: req.body.tags,
      image: imageUrl,
      updatedAt,
    }

    await validatePost(updatedPostData)

    // Filter out undefined values
    Object.keys(updatedPostData).forEach(
      (key) => updatedPostData[key] === undefined && delete updatedPostData[key],
    )

    await db.collection(COLLECTION_POST).doc(postId).update(updatedPostData)

    console.log('Post updated successfully')
    res.status(200).json({ postId: postId, message: 'Post updated successfully' })
  } catch (error) {
    console.error('Error updating post:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// * API to delete a post
const deletePostById = asyncHandler(async (req, res) => {
  try {
    // Ambil ID post dari parameter permintaan
    const postId = req.params.id

    // Validate user id
    const userId = req.user.uid

    if (!userId) {
      return res.status(403).json({
        error: 'Anda tidak memiliki izin untuk menghapus postingan ini',
      })
    }

    // Membuat referensi ke dokumen post
    const postRef = db.collection(COLLECTION_POST).doc(postId)

    const postDoc = await postRef.get()

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' })
    }

    // Menghapus dokumen post
    await postRef.delete()

    // Mengirimkan hasil ke client
    res.status(200).json({ id: postId })
  } catch (error) {
    // Tangani kesalahan dengan mengirim respons kesalahan
    res.status(500).json({ error: error.message })
  }
})

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  getPostById,
  updatePostById,
}
