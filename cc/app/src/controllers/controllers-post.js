import * as yup from 'yup'
import asyncHandler from 'express-async-handler'
import { db, firebase, storage } from '../utils/firebase'

const collection = 'f1Name'

const createPost = asyncHandler(async (req, res) => {
  const userId = req.params.id
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

    // Buat objek post dengan menambahkan URL gambar dan timestamp
    const postRequest = {
      ...postData,
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

    // Dapatkan data pengguna yang ingin ditambahkan postingan
    const userRef = db.collection(collection).doc(userId)
    const userSnapshot = await userRef.get()
    const userData = userSnapshot.data()

    // Update pengguna dengan menambahkan ID post ke daftar postingan pengguna
    const updatedUserData = {
      ...userData,
      posts: [...userData.posts, postId],
    }

    // Simpan data pengguna yang diperbarui kembali ke Firestore
    await userRef.set(updatedUserData)

    // Kirim respons ke client
    res.status(201).json({ id: postId, data: validatedPost })
  } catch (error) {
    res.status(500).json({ message: 'Something Erorr', error: error.message })
  }
})

// ! OLD VERSION
// const getAllPosts = asyncHandler(async (req, res) => {
//   const { title, userId } = req.query

//   try {
//     const docRef = db.collection('posts')
//     const snapshot = await docRef.get()

//     const dataArray = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }))

//     const result = dataArray.filter((item) => {
//       const nameMatch = item.title.includes(title || '')
//       const idMatch = item.id === userId || !userId
//       return nameMatch && idMatch
//     })

//     res.status(200).json(result)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

// ? NEW VERSION
const getAllPosts = asyncHandler(async (req, res) => {
  const { title, userId, tag } = req.query

  try {
    // Membuat referensi ke koleksi 'posts'
    const postsCollection = db.collection('posts')

    // Membuat query dengan kondisi array-contains untuk mencari berdasarkan tag
    let postsQuery = postsCollection
    if (tag) {
      postsQuery = postsQuery.where('tags', 'array-contains', tag)
    }

    // Menjalankan query dan mendapatkan snapshot
    const postsSnapshot = await postsQuery.get()

    // Mengubah snapshot menjadi array
    const postsData = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Melakukan filter berdasarkan judul dan/atau ID pengguna
    const filteredPosts = postsData.filter((post) => {
      const titleMatch = post.title.includes(title || '')
      const idMatch = post.id === userId || !userId
      return titleMatch && idMatch
    })

    // Mengirimkan hasil ke client
    res.status(200).json(filteredPosts)
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
  try {
    // Ambil ID post dari parameter permintaan
    const postId = req.params.id

    // Ambil data pembaruan dari tubuh permintaan
    const { title, caption, tags, like } = req.body

    // Membuat objek postUpdate hanya dengan properti yang tidak undefined
    const postUpdate = {}
    if (title !== undefined) postUpdate.title = title
    if (caption !== undefined) postUpdate.caption = caption
    if (tags !== undefined) postUpdate.tags = tags
    if (like !== undefined) postUpdate.like = like

    // Ambil timestamp untuk pengaturan update_at
    const timestamp = firebase.firestore.Timestamp.fromDate(new Date())

    // Tambahkan properti update_at ke objek pembaruan post
    postUpdate.update_at = timestamp

    // Skema validasi untuk data post
    const postSchema = yup.object({
      title: yup.string().required(),
      caption: yup.string().required(),
      tags: yup.array().of(yup.string().required()).optional(),
      like: yup.number().required().positive().integer(),
      update_at: yup.date().required(),
    })

    // Validasi data post
    const validatedPost = await postSchema.validate(postUpdate)

    // Membuat referensi ke dokumen post
    const postRef = db.collection('posts').doc(postId)

    // Memperbarui dokumen post
    await postRef.update(validatedPost)

    // Mengirimkan hasil ke client
    res.status(200).json({ id: postId, data: validatedPost })
  } catch (error) {
    // Tangani kesalahan dengan mengirim respons kesalahan
    res.status(500).json({ error: error.message })
  }
})

export { getAllPosts, createPost, getPostById, updatePostById }
