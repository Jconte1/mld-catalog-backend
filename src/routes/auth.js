import express from 'express'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()

// ✅ REGISTER
router.post('/register', async (req, res) => {
  const { email, password, customerId } = req.body

  if (!email || !password || !customerId) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { customerId }
    })

    if (!customer) {
      return res.status(400).json({ message: 'Invalid Customer ID' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        customerId
      }
    })

    return res.status(201).json({ message: 'User created successfully' })
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// ✅ LOGIN WITH JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        customerId: user.customerId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      email: user.email,
      customerId: user.customerId
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

export { router as default }
