const firebase = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const db = firebase.firestore();

module.exports = { db, firebase };
