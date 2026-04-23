import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, country, mobile } = req.body
    
    const nameParts = name.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      country,
      phone: mobile,
    })

    await user.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' })
    res.status(201).json({ token, user: { id: user._id, email: user.email, firstName: user.firstName } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password || '')
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' })
    res.json({ token, user: { id: user._id, email: user.email, firstName: user.firstName } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}
