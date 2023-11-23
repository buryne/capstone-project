const admin = require("firebase-admin")
const credentials = require("../../serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(credentials),
})

const db = admin.firestore()

module.exports = db
