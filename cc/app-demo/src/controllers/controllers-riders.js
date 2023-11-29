const asynchandler = require('express-async-handler')
const db = require('../utils/firestore')

const getRiders = asynchandler(async (req, res) => {
  try {
    const { name } = req.query
    const query = db.collection('f1Name')

    if (name) {
      // Menggunakan >= dan < untuk mencari data yang sebagian cocok dengan nama
      //   const startName = name
      //   const endName = name + "\uf8ff"
      //   query = query.where("name", ">=", startName).where("name", "<", endName)
      //   const startName = name
      //   const endName = name + "\uf8ff"
      //   query = query.where("name", ">=", endName).where("name", "<", startName)
      //   console.log("query", name)
      //   console.log("startName", startName)
      //   console.log("endName", endName)
    }

    // const snapshot = await query.get()
    // const f1Name = []

    // // snapshot.forEach((doc) => {
    // //   const id = doc.id
    // //   const data = doc.data()

    // //   f1Name.push({ id, ...data })
    // // })

    const snapshot = await query.get().then((snapshot) => {
      // Mengubah snapshot menjadi array
      const dataArray = snapshot.docs.map((doc) => doc.data())

      // Menggunakan filter untuk mencari objek dengan string "Marquez" di dalam properti "name"
      const result = dataArray.filter((item) => item.name.includes(name))

      // Menggunakan result untuk melakukan apa pun yang diperlukan dengan objek yang sesuai
      console.log(result)

      res.status(200).json(result)
    })

    return snapshot
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const createRiders = asynchandler(async (req, res) => {
  try {
    const { name, team, nation, posts } = req.body

    console.log('req.body', req.body)

    if (!posts || !posts.length || !posts[0].title) {
      console.log('title', posts[0].title)
      // Handle the case where the title is not provided in the request body
      return res.status(400).json({ error: 'Title is required.' })
    }

    const f1NameRequest = {
      name,
      team,
      nation,
      posts: [
        {
          title: posts[0].title,
        },
      ],
    }

    const docRef = await db.collection('f1Name').add(f1NameRequest)

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

const updateRiderById = asynchandler(async (req, res) => {
  try {
    const { id } = req.params

    const docRef = db.collection('f1Name').doc(id)
    await docRef.update(req.body)
    const doc = await docRef.get()
    const data = doc.data()

    res.status(200).json({ id, data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = {
  getRiders,
  createRiders,
  updateRiderById,
}
