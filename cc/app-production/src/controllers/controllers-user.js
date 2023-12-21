const asyncHandler = require('express-async-handler')
const { db, auth } = require('../utils/firebase.js')
const { saveUserToFirestore } = require('../utils/auth.js')
const bcrypt = require('bcrypt')

// const yup = require('yup')

const collection = 'users'

const registerUser = asyncHandler(async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  try {
    const users = await auth.createUser({
      email: req.body.email,
      password: req.body.password,
      emailVerified: false,
      disabled: false,
    })

    const userResult = await saveUserToFirestore({
      uid: users.uid,
      email: users.email,
      password: hashedPassword,
      posts: [],
    })

    res.status(200).json(userResult)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { name, userId } = req.query

    // Membuat referensi ke koleksi 'f1Name'
    const usersRef = db.collection(collection)

    // Mengambil snapshot dari koleksi
    const snapshot = await usersRef.get()

    // Mengubah snapshot menjadi array objek dengan properti id dan data
    const dataArray = snapshot.docs.map((doc) => {
      // eslint-disable-next-line no-unused-vars
      const { accessToken, uid, ...data } = doc.data()

      return {
        id: doc.id,
        ...data,
      }
    })

    // Melakukan filter berdasarkan nama dan/atau ID pengguna
    const result = dataArray.filter((item) => {
      const nameMatch = item.displayName.includes(name || '')
      const idMatch = item.id === userId || !userId
      return nameMatch && idMatch
    })

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Mengirimkan hasil ke client
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ? Function
const getPostDetailsByUserId = async (userId) => {
  try {
    const userRef = db.collection(collection).doc(userId)
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
      userId: userSnapshot.id,
      ...userData,
      posts: postDetails,
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id

  try {
    const userData = await getPostDetailsByUserId(userId)

    if (!userData) {
      return res.status(404).json({ message: `User with id: ${userId} not found` })
    }

    res.status(200).json({ id: userId, data: userData })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const deleteUserById = asyncHandler(async (req, res) => {
  const userId = req.params.userId
  try {
    // Dapatkan referensi dokumen pengguna dari Firestore
    const userDocRef = db.collection(collection).doc(userId)

    // Dapatkan data pengguna sebelum dihapus
    const userDoc = await userDocRef.get()
    const userData = userDoc.data()

    // Periksa apakah pengguna ditemukan
    if (!userData) {
      return res.status(404).json({ message: `User with id: ${userId} not found` })
    }

    // Hapus dokumen pengguna
    await userDocRef.delete()

    const successMessage = {
      message: `User with id: ${userId} successfully deleted`,
      data: userData,
    }

    res.status(200).json(successMessage)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = {
  getAllUsers,
  getUserById,
  deleteUserById,
  registerUser,
}
