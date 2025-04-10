import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

import authRoutes from './routes/auth.js'
import accountRoutes from './routes/account.js' 

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// ✅ API Routes
app.use('/api', authRoutes)
app.use('/api/account', accountRoutes)

app.get('/', (req, res) => {
  res.send('MLD Backend API is running ✅')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
