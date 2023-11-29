import * as firebase from 'firebase-admin'
import * as serviceAccount from '../../serviceAccountKey.json'

firebase.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://percobaan-dulu-2e8d8.appspot.com',
})

const db = firebase.firestore()
const storage = firebase.storage().bucket()


export { db, storage, firebase }
