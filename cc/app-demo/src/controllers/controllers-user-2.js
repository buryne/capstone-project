const asynchandler = require('express-async-handler')
// const { object, string, number, date, array } = require("yup")
const { admin, db } = require('../utils/firestore')

const createUser = asynchandler(async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profileUrl,
      title,
      caption,
      image,
      tags,
      like,
    } = req.body

    // // create random id for user mix number and character use crypto
    // const id = crypto.randomBytes(16).toString('hex')

    // // add timestamp to posts array object
    // const timestamp = admin.firestore.Timestamp.fromDate(new Date())

    const userRequset = {
      name,
      email,
      password,
      profileUrl,
      posts: [
        {
          title,
          caption,
          image,
          tags,
          like,
        },
      ],
    }

    // let userSchema = object({
    //   name: string().required(),
    //   email: string().email(),
    //   password: number().required().positive().integer(),
    //   profileUrl: string().url().nullable(),
    //   posts: array().of(
    //     object({
    //       title: string().required(),
    //       caption: string().required(),
    //       image: string().url().required(),
    //       tags: array().of(string().required()),
    //       like: number().required().positive().integer(),
    //       create_at: date().default(function () {
    //         return new Date()
    //       }),
    //       update_at: date().default(function () {
    //         return new Date()
    //       }),
    //     }),
    //   ),
    // })

    // const user = await userSchema.validate(userRequset)
    const options = { ignoreUndefinedProperties: true }

    const docRef = (await db.collection('users').add(userRequset)).set(options)

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

module.exports = {
  createUser,
}
