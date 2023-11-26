const asynchandler = require('express-async-handler')
const { admin, db, storage } = require('../utils/firestore')
const { object, string, number, date, array } = require('yup')

// ! OLD
// eslint-disable-next-line no-unused-vars
const createUser = asynchandler(async (req, res) => {
  try {
    const { name, email, password, profileUrl, posts } = req.body

    // create random id for user mix number and character use MATH
    const id = Math.random().toString(36).slice(2)

    // add timestamp to posts array object
    const timestamp = admin.firestore.Timestamp.fromDate(new Date())

    const userRequset = {
      name,
      email,
      password,
      profileUrl,
      posts:
        [
          {
            id,
            title: posts[0].title,
            caption: posts[0].caption,
            image: posts[0].image,
            tags: posts[0].tags,
            like: posts[0].like,
          },
        ] || [],
      created: timestamp,
    }

    if (!posts || !posts.length || !posts[0].title) {
      console.log('title', posts[0].title)
      // Handle the case where the title is not provided in the request body
      return res.status(400).json({ error: 'Title is required.' })
    }

    const userSchema = object({
      name: string().required(),
      email: string().email(),
      password: number().required().positive().integer(),
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

    const user = await userSchema.validate(userRequset)

    const docRef = await db.collection('f1Name').add(user)

    const doc = await docRef.get()
    const data = doc.data()

    res.status(201).json({
      id: doc.id,
      data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ! NEW
const createUser2 = asynchandler(async (req, res) => {
  try {
    const { name, email, password, profileUrl, posts } = req.body

    if (!posts || !posts.length || !posts[0].title) {
      // Handle the case where the title is not provided in the request body
      return res.status(400).json({ error: 'Title is required.' })
    }

    // add timestamp to posts array object
    const timestamp = admin.firestore.Timestamp.fromDate(new Date())

    const userRequest = {
      name,
      email,
      password,
      profileUrl,
      posts: posts.map((post) => ({
        title: post.title,
        caption: post.caption,
        image: post.image,
        tags: post.tags,
        like: post.like,
        create_at: timestamp,
        update_at: timestamp,
      })),
      created: timestamp,
    }

    const userSchema = object({
      name: string().required(),
      email: string().email(),
      password: number().required().positive().integer(),
      profileUrl: string().url().nullable(),
      posts: array()
        .of(
          object({
            title: string().required(),
            caption: string().required(),
            image: string().url().required(),
            tags: array().of(string().required()),
            like: number().required().positive().integer(),
            // create_at: date(),
            // update_at: date(),
          }),
        )
        .optional(),
    })

    const user = await userSchema.validate(userRequest)

    const docRef = await db.collection('f1Name').add(user)

    const doc = await docRef.get()
    const data = doc.data()

    res.status(201).json({
      id: doc.id,
      data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const getUsers = asynchandler(async (req, res) => {
  try {
    const usersDB = db.collection('f1Name')

    const users = []

    const snapshot = await usersDB.get()

    snapshot.forEach((doc) =>
      users.push({
        id: doc.id,
        ...doc.data(),
      }),
    )

    console.log(users)

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

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

const getUserById = asynchandler(async (req, res) => {
  const { id } = req.params

  const docRef = db.collection('f1Name').doc(id)
  const doc = await docRef.get()
  const data = doc.data()

  res.status(200).json({ id, data })
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
}
