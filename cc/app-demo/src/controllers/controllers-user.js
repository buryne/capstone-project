const asynchandler = require('express-async-handler')
const { admin, db, storage } = require('../utils/firestore')
const { object, string, number, date, array } = require('yup')

// ! OLD
// eslint-disable-next-line no-unused-vars
// const createUser = asynchandler(async (req, res) => {
//   try {
//     const { name, email, password, profileUrl } = req.body

//     // create random id for user mix number and character use MATH

//     // add timestamp to posts array object
//     const timestamp = admin.firestore.Timestamp.fromDate(new Date())

//     const userRequset = {
//       name,
//       email,
//       password,
//       profileUrl,
//       posts: [],
//       created: timestamp,
//     }

//     // if (!posts || !posts.length || !posts[0].title) {
//     //   console.log('title', posts[0].title)
//     //   // Handle the case where the title is not provided in the request body
//     //   return res.status(400).json({ error: 'Title is required.' })
//     // }

//     const userSchema = object({
//       name: string().required(),
//       email: string().email(),
//       password: number().required().positive().integer(),
//       profileUrl: string().url().nullable(),
//       posts: array()
//         .of(
//           object({
//             title: string().required(),
//             caption: string().required(),
//             image: string().url().required(),
//             tags: array().of(string().required()),
//             like: number().required().positive().integer(),
//             create_at: date(),
//             update_at: date(),
//           }),
//         )
//         .optional(),
//     })

//     const user = await userSchema.validate(userRequset)

//     const docRef = await db.collection('f1Name').add(user)

//     const doc = await docRef.get()
//     const data = doc.data()

//     res.status(201).json({
//       id: doc.id,
//       data,
//     })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

// ! OLD
const uploadPosts = asynchandler(async (req, res) => {
  const { id } = req.params
  const { title, caption, tags, like } = req.body

  // const userRequset = {
  //   title,
  //   caption,
  //   image,
  //   tags,
  //   like,
  // }

  // ! NEW
  const file = req.file // File gambar
  const fileName = 'images/' + Date.now() + '_' + file.originalname

  const fileRef = storage.file(fileName)

  // Lakukan proses upload
  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  })

  // Dapatkan URL gambar setelah upload selesai
  const downloadURL = `https://storage.googleapis.com/${storage.name}/${fileName}`

  const userRequset = {
    title,
    caption,
    image: downloadURL,
    tags,
    like,
  }

  const docRef = db.collection('f1Name').doc(id)
  await docRef.update({
    posts: admin.firestore.FieldValue.arrayUnion(userRequset),
  })
  const doc = await docRef.get()
  const data = doc.data()

  res.status(200).json({ id, data })

  // update user
})

// ! NEW V2
const createUser = asynchandler(async (req, res) => {
  try {
    const { name, email, password, profileUrl } = req.body

    // add timestamp to user object
    const timestamp = admin.firestore.Timestamp.fromDate(new Date())

    const userRequest = {
      profileUrl,
      posts: [], // Awalnya, tidak ada posting yang ditautkan dengan pengguna
      created: timestamp,
      name,
      email,
      password,
    }

    const userSchema = object({
      name: string().required(),
      email: string().email(),
      password: string(),
      profileUrl: string().url().nullable(),
      posts: array()
        .of(
          object({
            title: string().required(),
            caption: string().required(),
            image: string().url().required(),
            tags: array().of(string().required()),
            like: number().required().positive().integer(),
            create_at: date(),
            update_at: date(),
          }),
        )
        .optional(),
    })

    const user = await userSchema.validate(userRequest)

    // Tambahkan user ke koleksi 'f1Name'
    const userRef = await db.collection('f1Name').add(user)

    const doc = await userRef.get()
    const data = doc.data()

    // Ambil ID pengguna yang baru dibuat
    const userId = userRef.id

    res.status(201).json({
      id: userId,
      ...data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const getUsers = asynchandler(async (req, res) => {
  try {
    const { name, userId } = req.query
    const docRef = db.collection('f1Name')

    const snapshot = await docRef.get()
    const dataArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const result = dataArray.filter((item) => {
      const nameMatch = item.name.includes(name || '')
      const idMatch = item.id === userId || !userId
      return nameMatch && idMatch
    })

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const createPost = asynchandler(async (req, res) => {
  try {
    const { id } = req.params
    const { title, caption, tags, like } = req.body

    // add timestamp to post object
    const timestamp = admin.firestore.Timestamp.fromDate(new Date())

    // ! NEW
    const file = req.file // File gambar
    const fileName = 'images/' + Date.now() + '_' + file.originalname

    const fileRef = storage.file(fileName)

    // Lakukan proses upload
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    })

    // Dapatkan URL gambar setelah upload selesai
    const downloadURL = `https://storage.googleapis.com/${storage.name}/${fileName}`

    const postRequest = {
      title,
      caption,
      image: downloadURL,
      tags,
      like,
      create_at: timestamp,
      update_at: timestamp,
    }

    const postSchema = object({
      title: string().required(),
      caption: string().required(),
      image: string().url().required(),
      tags: array().of(string().required()).optional(),
      like: number().required().positive().integer(),
    })

    const post = await postSchema.validate(postRequest)

    // Tambahkan post ke koleksi 'posts'
    const postRef = await db.collection('posts').add(post)

    // Ambil ID post yang baru dibuat
    const postId = postRef.id

    // Dapatkan data pengguna yang ingin ditambahkan postingan
    const userRef = db.collection('f1Name').doc(id)
    const userSnapshot = await userRef.get()
    const userData = userSnapshot.data()

    // Update pengguna menambahkan ID postingan ke daftar postingan pengguna
    await userRef.update({
      posts: [...userData.posts, postId],
    })

    res.status(201).json({
      id: postId,
      data: post,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const getPostDetailsByUserId = async (userId) => {
  try {
    const userRef = db.collection('f1Name').doc(userId)
    const userSnapshot = await userRef.get()
    const userData = userSnapshot.data()

    const postDetails = []

    if (userData.posts && userData.posts.length > 0) {
      for (const postId of userData.posts) {
        const postRef = db.collection('posts').doc(postId)
        const postSnapshot = await postRef.get()
        const postData = postSnapshot.data()

        if (postData) {
          postDetails.push({ id: postSnapshot.id, ...postData })
        }
      }
    }

    // Menggabungkan data pengguna dengan detail postingan
    return {
      userId: userId,
      ...userData,
      posts: postDetails,
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const getUserById = asynchandler(async (req, res) => {
  const { id } = req.params

  const userData = await getPostDetailsByUserId(id)
  res.status(200).json(userData)
})

const updateUserById = asynchandler(async (req, res) => {
  const { id } = req.params

  const { name, email, password, profileUrl } = req.body

  // Membuat objek userRequest hanya dengan properti yang tidak undefined
  const userRequest = {}
  if (name !== undefined) userRequest.name = name
  if (email !== undefined) userRequest.email = email
  if (password !== undefined) userRequest.password = password
  if (profileUrl !== undefined) userRequest.profileUrl = profileUrl

  try {
    const docRef = db.collection('f1Name').doc(id)
    await docRef.update(userRequest)

    const doc = await docRef.get()
    const data = doc.data()

    res.status(200).json({ id, data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const updatePostById = asynchandler(async (req, res) => {
  const { id } = req.params
  const { title, caption, tags, like } = req.body
  // 5djof1yycjx
  const userRequset = {
    title,
    caption,
    tags,
    like,
  }

  const docRef = db.collection('f1Name').where('posts.id', '==', id)

  await docRef.update({
    posts: admin.firestore.FieldValue.arrayUnion(userRequset),
  })
  const doc = await docRef.get()
  const data = doc.data()

  res.status(200).json({ id, data })
})

module.exports = {
  createUser,
  getUsers,
  uploadPosts,
  getUserById,
  updatePostById,
  createPost,
  updateUserById,
}
