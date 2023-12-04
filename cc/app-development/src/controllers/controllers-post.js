const yup = require('yup')
const asyncHandler = require('express-async-handler')
const { db, firebase, storage } = require('../utils/firebase.js')

const collection = 'users'

const createPost = asyncHandler(async (req, res) => {
  const userId = req.user.uid
  const postData = req.body

  try {
    // Ambil timestamp untuk pengaturan create_at dan update_at
    const timestamp = firebase.firestore.Timestamp.fromDate(new Date())

    // Ambil file dari request
    const file = req.file
    const fileName = 'images/' + Date.now() + '_' + file.originalname

    // Referensi ke file di storage
    const fileRef = storage.file(fileName)

    // Simpan file ke storage
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    })

    // Dapatkan URL gambar setelah upload selesai
    const downloadURL = `https://storage.googleapis.com/${storage.name}/${fileName}`

    const tags = req.body.tags
      ? req.body.tags.split(',').map((tag) => tag.trim())
      : []

    // Buat objek post dengan menambahkan URL gambar dan timestamp
    const postRequest = {
      userId,
      ...postData,
      tags,
      image: downloadURL,
      create_at: timestamp,
      update_at: timestamp,
    }

    // Validasi objek post menggunakan skema
    const postSchema = yup.object({
      title: yup.string().required(),
      caption: yup.string().required(),
      image: yup.string().url().required(),
      tags: yup.array().of(yup.string().required()).optional(),
      like: yup.number().required().positive().integer(),
    })

    // Validasi data post
    const validatedPost = await postSchema.validate(postRequest)

    if (!userId) {
      return res.status(400).json({ error: 'Invalid userId' })
    }

    const userQuery = await db
      .collection(collection)
      .where('uid', '==', userId)
      .get()

    if (userQuery.empty) {
      // If the user does not exist, you might want to handle this case
      return res.status(404).json({ error: 'User not found' })
    }

    // Retrieve the first document from the query result
    const userDoc = userQuery.docs[0]

    // Dapatkan data pengguna yang ingin ditambahkan postingan
    const userRef = db.collection(collection).doc(userDoc.id)
    const userSnapshot = await userRef.get()
    const userData = userSnapshot.data()

    // Tambahkan post ke koleksi 'posts'
    const postRef = await db.collection('posts').add(validatedPost)
    const postId = postRef.id

    // Update pengguna dengan menambahkan ID post ke daftar postingan pengguna
    const updatedUserData = {
      // ...userData,
      posts: [...userData.posts, postId],
    }

    // Simpan data pengguna yang diperbarui kembali ke Firestore
    await userRef.update(updatedUserData)

    const postResult = {
      id: postId,
      ...validatedPost,
    }

    // Kirim respons ke client
    res.status(201).json(postResult)

    // res.render('post-created', { postId, data: validatedPost })
  } catch (error) {
    res.status(500).json({ message: 'Something Erorr', error: error.message })
  }
})

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
        const userSnapshot = await db
          .collection('users')
          .where('uid', '==', uid)
          .get()

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
          user,
        }

        // Remove userId property if it's present
        delete postWithUserData.userId

        return postWithUserData
      }),
    )

    // Render the EJS template
    res.render('allPosts', { posts: postsWithUserData })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

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
        const userSnapshot = await db
          .collection('users')
          .where('uid', '==', uid)
          .get()

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

const getPostById = asyncHandler(async (req, res) => {
  const postId = req.params.id

  try {
    // Membuat referensi ke dokumen post
    const postRef = db.collection('posts').doc(postId)

    // Mendapatkan snapshot dari dokumen post
    const postSnapshot = await postRef.get()

    // Mengubah snapshot menjadi objek
    const postData = {
      id: postSnapshot.id,
      ...postSnapshot.data(),
    }

    res.status(200).json(postData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const updatePostById = asyncHandler(async (req, res) => {
  const id = req.params.id
  const userId = req.user.uid

  const { title, caption, tags, like } = req.body

  try {
    // Membuat referensi ke dokumen post
    const postRef = db.collection('posts').doc(id)
    // Memeriksa kepemilikan postingan sebelum memperbarui
    const postDoc = await postRef.get()
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Postingan tidak ditemukan' })
    }

    // Mendapatkan pemilik postingan dari dokumen post
    const postOwner = postDoc.data().userId

    if (postOwner !== userId) {
      return res.status(403).json({
        error: 'Anda tidak memiliki izin untuk memperbarui postingan ini',
      })
    }

    // Jika pemilik diverifikasi, lanjutkan dengan pembaruan

    const updateAt = firebase.firestore.Timestamp.fromDate(new Date())

    // Membuat objek pembaruan post hanya dengan properti yang tidak undefined
    const postUpdate = {}
    if (title !== undefined) postUpdate.title = title
    if (caption !== undefined) postUpdate.caption = caption
    if (tags !== undefined) postUpdate.tags = tags
    if (like !== undefined) postUpdate.like = like

    // Check if a new file is provided
    if (req.file) {
      const file = req.file
      const fileName = 'images/' + Date.now() + '_' + file.originalname

      // Referensi ke file di storage
      const fileRef = storage.file(fileName)

      // Simpan file ke storage
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      })

      // Dapatkan URL gambar setelah upload selesai
      const downloadURL = `https://storage.googleapis.com/${storage.name}/${fileName}`

      // Update image property in the postRequest object
      postUpdate.image = downloadURL
    }

    // eslint-disable-next-line camelcase
    postUpdate.update_at = updateAt

    // Validasi data post
    const postSchema = yup.object({
      title: yup.string().required(),
      caption: yup.string().required(),
      tags: yup.array().of(yup.string().required()).optional(),
      image: yup.string().required(),
      like: yup.number().required().positive().integer(),
      update_at: yup.date().required(),
    })

    // Validasi data post
    const validatedPost = await postSchema.validate(postUpdate)

    // Memperbarui dokumen post
    await postRef.update(validatedPost)

    // Mengirimkan hasil ke client
    res.status(200).json({ id, data: validatedPost })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const deletePostById = asyncHandler(async (req, res) => {
  try {
    // Ambil ID post dari parameter permintaan
    const postId = req.params.id

    // validate user id
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

    // Mendapatkan pemilik postingan dari dokumen post
    const postOwner = postDoc.data().userId

    if (postOwner !== userId) {
      return res.status(403).json({
        error: 'Anda tidak memiliki izin untuk memperbarui postingan ini',
      })
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
  updatePostById,
  deletePostById,
  getAllPostsView,
}
