import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: any
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token failed' })
  }
}
