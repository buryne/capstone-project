const express = require('express')
const {
  getAllPostsView,
  UpdatePostsView,
  getUpdatePostView,
  createPost,
} = require('../controllers/controllers-post-ejs')
const upload = require('../utils/multer')
const { getUserDocByUid } = require('../services/user-action')

const router = express.Router()

// router
//   .get('/', getAllPostsView)
//   .get('/:id', getUpdatePostView)
//   .post('/', upload.single('image'), createPost)
//   .patch('/:id', UpdatePostsView)
// .delete('/:id', deletePostById)

// EJS

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    // Continue to the next middleware if the user is authenticated
    return next()
  }
  // Render the index page with authentication status
  return res.render('index', { isAuthenticated: false })
}

// ! Create Post
router.get('/create-post', isLoggedIn, (req, res) => {
  if (!req.user) {
    return res.redirect('/ui') // Redirect to login if not logged in
  }
  // Retrieve user information from your authentication system
  const userId = req.user // Assuming you have the userId in the user object
  res.render('create-post', { userId })
})

// ! Create Post
router.post('/create-post', isLoggedIn, upload.single('image'), createPost)

// ! Get All Post
router.get('/allPosts', getAllPostsView)

// ! Get Login Callback
// router.get(
//   'auth/google/callback',
//   passport.authenticate('google', {
//     successRedirect: '/profile',
//     failureRedirect: '/auth/google/failure',
//   }),
// )

// ! Get Profile
router.get('/profile', isLoggedIn, async (req, res) => {
  if (!req.user) {
    return res.redirect('/web') // Redirect to login if not logged in
  }

  const username = req.user.displayName
  const photoURL = req.user.photoURL
  const uid = req.user.uid

  try {
    // Menerima dokumen pengguna berdasarkan uid
    const user = await getUserDocByUid(uid)

    console.log('user', user)
    console.log('uid', uid)

    res.render('profile', { username, photoURL, uid, user_id: user.id })
  } catch (error) {
    res.status(500).render('error', { message: error.message })
  }
})

// ! Edit Post
router.get('/edit-post/:postId', isLoggedIn, getUpdatePostView)
router.post('/edit-post/:postId', isLoggedIn, upload.single('image'), UpdatePostsView)

// ! Another
router.get('/web', isLoggedIn, async (req, res) => {
  try {
    // If the user is authenticated, render a personalized greeting
    res.render('index', {
      username: req.user.displayName,
      isAuthenticated: true,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
