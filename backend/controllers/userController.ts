import { Response } from 'express'
import { User } from '../models/User'
import { AuthRequest } from '../middleware/authMiddleware'

export const getUsers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const skip = parseInt(req.query.skip as string) || 0
    const limit = parseInt(req.query.limit as string) || 5
    const search = (req.query.q as string) || ''

    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const users = await User.find(filter).skip(skip).limit(limit).select('-password')
    const total = await User.countDocuments(filter)

    res.json({
      users: users.map(u => ({
        id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        gender: u.gender,
        country: u.country
      })),
      total,
      skip,
      limit
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const addUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = new User(req.body)
    await user.save()
    res.status(201).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        country: user.country
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        country: user.country
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
