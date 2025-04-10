import express from 'express'
import prisma from '../services/index.js'

import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.put('/update', authenticateToken, async (req, res) => {
  const { firstName, lastName } = req.body

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First and last name are required' })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: req.user.email },
      data: { firstName, lastName },
    })

    res.status(200).json({ message: 'Account updated', user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
