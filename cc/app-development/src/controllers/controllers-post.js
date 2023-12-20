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

const collection = 'users'

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
    const userRef = db.collection(collection).doc(userDoc.id)

    const validatedPost = await addPostToCollection(postRequest)
    await updateUserPosts(userRef, userDoc, validatedPost)

    const postResult = {
      id: validatedPost.id,
      ...validatedPost,
    }

    res.render('post-created', { postId: validatedPost.id, data: postResult })
    // res.status(200).json({ postId: validatedPost.id, data: postResult })
  } catch (error) {
    res.status(500).json({ message: 'Something Error', error: error.message })
  }
})

// Rewrite name of function from getAllPostsView to getAllPosts
const getAllPostsView = asyncHandler(async (req, res) => {
  try {
    // Fetch all posts
    const postsSnapshot = await db.collection('posts').get()
    const postsData = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch user data for each post
    const postsWithUserData = await Promise.all(
      postsData.map(async (post) => {
        const uid = post.userId
        const userSnapshot = await db.collection('users').where('uid', '==', uid).get()

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
    // res.status(200).json({ posts: sortedPosts, loggedInUser: req.user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ! OFF FEATURE
const getAllPosts = asyncHandler(async (req, res) => {
  try {
    // Fetch all posts
    const postsSnapshot = await db.collection('posts').get()
    const postsData = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch user data for each post
    const postsWithUserData = await Promise.all(
      postsData.map(async (post) => {
        // Fetch user data based on userId
        console.log('post', post.userId)
        const uid = post.userId
        const userSnapshot = await db.collection('users').where('uid', '==', uid).get()

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

    res.status(200).json(postsWithUserData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

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

const getPostById = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id
    const post = await getPostByIdDB(postId)

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const getEditPostView = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.postId
    const post = await getPostByIdDB(postId)

    console.log('post', post)
    console.log('req.user.uid', req.user.uid)
    console.log('post.userId', post.userId)

    if (!post || post.userId !== req.user.uid) {
      return res.status(403).send('You do not have permission to edit this post.')
    }

    res.render('editPost', { post })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ! Function to handle the form submission when editing a post
const editPost = asyncHandler(async (req, res) => {
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
      image: imageUrl, // Updated image URL
      // Update other fields as needed
    }

    await db.collection('posts').doc(postId).update(updatedPostData)

    console.log('Post updated successfully')
    res.redirect('/allPosts')
  } catch (error) {
    console.error('Error updating post:', error.message)
    res.status(500).json({ error: error.message })
  }
})

const updatePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id
    const post = await getPostByIdDB(postId)

    if (!post || post.userId !== req.user.uid) {
      return res.status(403).json({ error: 'You do not have permission to edit this post.' })
    }

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
      location: req.body.location,
      tags: req.body.tags,
      updatedAt,
      image: imageUrl, // Updated image URL
      // Update other fields as needed
    }

    // await validatePost(updatedPostData)

    // Filter out undefined values
    Object.keys(updatedPostData).forEach(
      (key) => updatedPostData[key] === undefined && delete updatedPostData[key],
    )

    await db.collection('posts').doc(postId).update(updatedPostData)

    console.log('Post updated successfully')
    res.status(200).json({ message: 'Post updated successfully' })
  } catch (error) {
    console.error('Error updating post:', error.message)
    res.status(500).json({ error: error.message })
  }
})

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
    const postRef = db.collection('posts').doc(postId)

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

// ! OFF FEATURE
// const getAllPosts = asyncHandler(async (req, res) => {
//   const { title, userId, tag } = req.query

//   try {
//     // Membuat referensi ke koleksi 'posts'
//     const postsCollection = db.collection('posts')

//     let postsQuery = postsCollection
//     if (tag) {
//       postsQuery = postsQuery.where('tags', 'array-contains', tag)
//     }

//     // Menjalankan query dan mendapatkan snapshot
//     const postsSnapshot = await postsQuery.get()

//     // Mengubah snapshot menjadi array
//     const postsData = postsSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }))

//     // Melakukan filter berdasarkan judul dan/atau ID pengguna
//     const filteredPosts = postsData.filter((post) => {
//       const titleMatch = post.title.includes(title || '')
//       const idMatch = post.id === userId || !userId
//       return titleMatch && idMatch
//     })

//     // Mengirimkan hasil ke client
//     res.status(200).json(filteredPosts)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  getAllPostsView,
  editPost,
  getEditPostView,
  getPostById,
  updatePost,
}
