const asyncHandler = require('express-async-handler')
const { db } = require('../utils/firebase.js')
// const yup = require('yup')

const collection = 'users'

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const { name, userId } = req.query

    // Membuat referensi ke koleksi 'f1Name'
    const usersRef = db.collection(collection)

    // Mengambil snapshot dari koleksi
    const snapshot = await usersRef.get()

    // Mengubah snapshot menjadi array objek dengan properti id dan data
    const dataArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Melakukan filter berdasarkan nama dan/atau ID pengguna
    const result = dataArray.filter((item) => {
      const nameMatch = item.displayName.includes(name || '')
      const idMatch = item.id === userId || !userId
      return nameMatch && idMatch
    })

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
      userData: {
        userId: userSnapshot.id,
        ...userData,
        posts: postDetails,
      },
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
      return res
        .status(404)
        .json({ message: `User with id: ${userId} not found` })
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
      return res
        .status(404)
        .json({ message: `User with id: ${userId} not found` })
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

// ! OFF FEATURE
// const updateUserById = asyncHandler(async (req, res) => {
//   try {
//     // Ambil ID pengguna dari parameter permintaan
//     const userId = req.params.id

//     // Ambil data pembaruan dari tubuh permintaan
//     const { name, email, password, profileUrl } = req.body

//     // Membuat objek userUpdate hanya dengan properti yang tidak undefined
//     const userUpdate = {}
//     if (name !== undefined) userUpdate.name = name
//     if (email !== undefined) userUpdate.email = email
//     if (password !== undefined) userUpdate.password = password
//     if (profileUrl !== undefined) userUpdate.profileUrl = profileUrl

//     // Dapatkan referensi dokumen pengguna dari Firestore
//     const userDocRef = db.collection(collection).doc(userId)

//     // Update dokumen pengguna dengan data pembaruan
//     await userDocRef.update(userUpdate)

//     // Dapatkan data terbaru setelah pembaruan
//     const userDoc = await userDocRef.get()
//     const userData = userDoc.data()

//     // Kirim respons dengan ID pengguna dan data terbaru
//     res.status(200).json({ id: userId, data: userData })
//   } catch (error) {
//     // Tangani kesalahan dengan mengirim respons kesalahan
//     res.status(500).json({ error: error.message })
//   }
// })

// ! OFF FEATURE
// const createUser = asyncHandler(async (req, res) => {
//   try {
//     // Ambil data pengguna dari permintaan
//     const userData = req.body

//     // Buat timestamp untuk created
//     const timestamp = firebase.firestore.Timestamp.fromDate(new Date())

//     // Persiapkan objek data pengguna
//     const userRequest = {
//       ...userData,
//       posts: [],
//       created: timestamp,
//     }

//     // Skema validasi untuk data pengguna
//     const userSchema = yup.object({
//       name: yup.string().required(),
//       email: yup.string().email(),
//       password: yup.string(),
//       profileUrl: yup.string().url().nullable(),
//     })

//     // Validasi data pengguna
//     const validatedUser = await userSchema.validate(userRequest)

//     // Tambahkan pengguna ke koleksi 'f1Name'
//     const userRef = await db.collection(collection).add(validatedUser)

//     // Dapatkan data pengguna setelah penambahan
//     const userDoc = await userRef.get()
//     const userDataAfterAddition = userDoc.data()

//     // Ambil ID pengguna yang baru ditambahkan
//     const userId = userRef.id

//     // Kirim respons dengan header kustom dan data pengguna
//     res.status(201).json({ id: userId, ...userDataAfterAddition })
//   } catch (error) {
//     // Tangani kesalahan jika terjadi
//     res.status(500).json({ error: error.message })
//   }
// })

module.exports = {
  getAllUsers,
  getUserById,
  deleteUserById,
  // createUser,
  // updateUserById,
}
