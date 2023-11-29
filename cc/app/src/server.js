import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use((req, res, next) => {
  res.header('Jelajah-Nusantara', 'Jelajah Nusantara API')
  next()
})

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

app.get('/', async (req, res) => {
  try {
    res.send('Welcome to Jelajah Nusantara API')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`[⚡ server] Listening on url http://localhost:${PORT}`)
})
