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

// ! Function to handle the form submission when creating a new post
const createPost = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.uid
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

      res.render('post-created', { postId: validatedPost.id, data: postResult })
    }
  } catch (error) {
    res.status(500).json({ message: 'Something Error', error: error.message })
  }
})

// ! Function to handle the form submission when editing a post
const getUpdatePostView = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.postId
    const post = await getPostByIdDB(postId)

    if (!post || post.userId !== req.user.uid) {
      return res.status(403).send('You do not have permission to edit this post.')
    }

    res.render('editPost', { post })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ! Function to handle the form submission when editing a post
const UpdatePostsView = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.postId
    const post = await getPostByIdDB(postId)

    if (!post || post.userId !== req.user.uid) {
      return res.status(403).send('You do not have permission to edit this post.')
    }

    const tags = req.body.tags ? req.body.tags.split(',').map((tag) => tag.trim()) : []
    const updatedAt = firebase.firestore.Timestamp.fromDate(new Date())
    let imageUrl = post.image // Default to the existing image URL

    if (req.file) {
      if (post.image) {
        const previousFileName = post.image.split('/').pop() // Extract file name from URL
        const previousFileRef = storage.file('images/' + previousFileName)
        await previousFileRef.delete()
      }
      const file = req.file
      const fileName = 'images/' + Date.now() + '_' + file.originalname

      // Upload the file to storage
      const fileRef = storage.file(fileName)
      await fileRef.save(file.buffer, { metadata: { contentType: file.mimetype } })

      // Get the URL of the uploaded image with a cache-busting parameter
      imageUrl = `https://storage.googleapis.com/${storage.name}/${fileName}`
      console.log('New Image URL:', imageUrl)
    }

    const updatedPostData = {
      title: req.body.title,
      caption: req.body.caption,
      tags,
      updatedAt,
      image: imageUrl,
    }

    await db.collection('posts').doc(postId).update(updatedPostData)

    res.redirect('/allPosts')
  } catch (error) {
    console.error('Error updating post:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// !  Rewrite name of function from getAllPostsView to getAllPosts
const getAllPostsView = asyncHandler(async (req, res) => {
  try {
    // Fetch all posts
    const postsSnapshot = await db.collection(COLLECTION_POST).get()
    const postsData = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch user data for each post
    const postsWithUserData = await Promise.all(
      postsData.map(async (post) => {
        const uid = post.userId
        const userSnapshot = await db.collection(COLLECTION_USER).where('uid', '==', uid).get()

        const userSnapshot2 = await getUserDocument(uid)
        // Check if userSnapshot is not empty
        if (userSnapshot.empty) {
          console.log('User not found for post with userId:', uid)
          return post // Return the post without user data
        }
        const userData = userSnapshot2.data()
        // Assume there's only one document in the snapshot
        // const userData = userSnapshot.docs[0].data()

        const user = {
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
          uid: userData.uid,
        }

        // Combine post data with user data (excluding userId)
        const postWithUserData = {
          ...post,
          user,
        }

        // Remove userId property if it's present
        delete postWithUserData.userId

        return postWithUserData
      }),
    )

    const sortedPosts = postsWithUserData.sort(
      (a, b) => b.create_at.toDate() - a.create_at.toDate(),
    )

    // Render the EJS template
    res.render('allPosts', { posts: sortedPosts, loggedInUser: req.user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = {
  getAllPostsView,
  getUpdatePostView,
  UpdatePostsView,
  createPost,
}
