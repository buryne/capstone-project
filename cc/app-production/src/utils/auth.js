const passport = require('passport')
const dotenv = require('dotenv')
const { db } = require('./firebase')
const GoogleStrategy = require('passport-google-oauth20').Strategy

dotenv.config()

const GOOGLE_CLIENT_ID = 'your client id'
const GOOGLE_CLIENT_SECRET = 'your client secret'
const CALLBACKURL = 'http://localhost:5000/auth/google/callback'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.callbackURL || CALLBACKURL,
    },

    (accessToken, refreshToken, profile, cb) => {
      // console.log('Access Token: ', accessToken)
      // console.log('Refresh Token: ', refreshToken)
      // console.log('Profile: ', profile)

      const user = {
        uid: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        verified: profile.emails[0].verified,
        photoURL: profile.photos[0].value,
        provider: profile.provider,
        posts: [],
        accessToken: accessToken,
      }

      saveUserToFirestore(user)
        .then(() => {
          cb(null, profile)
        })
        .catch((error) => {
          cb(error, null)
        })
    },
  ),
)

// Serialisasi dan deserialisasi pengguna
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser(async (obj, done) => {
  return db
    .collection('users')
    .where('uid', '==', obj.id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        done(null, null)
      }

      snapshot.forEach((doc) => {
        const user = doc.data()
        done(null, user)
      })
    })
})

// eslint-disable-next-line require-jsdoc
async function saveUserToFirestore(user) {
  const userRef = db.collection('users').where('uid', '==', user.uid)

  const userQuerySnapshot = await userRef.get()

  // Jika pengguna sudah ada, kembalikan data pengguna yang sudah ada
  if (!userQuerySnapshot.empty) {
    return null
  }

  // Jika pengguna belum ada, simpan data pengguna ke Firestore
  await db.collection('users').add(user)

  return user
}
