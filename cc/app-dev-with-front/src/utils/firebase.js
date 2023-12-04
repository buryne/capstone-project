const firebase = require('firebase-admin')
const serviceAccount = require('../../serviceAccountKey.json')

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: 'gs://percobaan-dulu-2e8d8.appspot.com',
})

const db = firebase.firestore()
const storage = firebase.storage().bucket()

module.exports = { db, storage, firebase }
