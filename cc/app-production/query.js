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
