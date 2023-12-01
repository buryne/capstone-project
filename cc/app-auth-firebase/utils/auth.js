const passport = require('passport')
const { db } = require('./firebase')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const GOOGLE_CLIENT_ID =
  '496333779224-20pfjin8ee57h6aflaj8lpci1r2tug1s.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const callbackURL = 'http://localhost:5000/google/callback'

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log('Access Token: ', accessToken)
      console.log('Refresh Token: ', refreshToken)
      console.log('Profile: ', profile)

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
    }
  )
)

// Serialisasi dan deserialisasi pengguna
passport.serializeUser((user, done) => {
  done(null, user)
})

// passport.deserializeUser((obj, done) => {
//   console.log('Deserializing user: ', obj)
//   done(null, obj)
// })

passport.deserializeUser(async (obj, done) => {
  const userRef = db
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
