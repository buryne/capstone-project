const express = require('express')
const cors = require('cors')
require('dotenv').config()
const routeRiders = require('./routes/route-riders')
const routeUsers = require('./routes/route-users')

const app = express()
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.header('X-Hello', 'World')
  res.send('Hello World')
})

app.use('/api', routeRiders)
app.use('/api/users', routeUsers)

app.listen(PORT, () => {
  console.log(`[⚡ server] Listening on url http://localhost:${PORT}`)
})
