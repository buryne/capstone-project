const admin = require('firebase-admin');
const credentials = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  storageBucket: 'gs://percobaan-dulu-2e8d8.appspot.com',
});

const db = admin.firestore();

const storage = admin.storage().bucket();

module.exports = {
  db,
  admin,
  storage,
};
