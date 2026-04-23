import express from 'express'
import { protect } from '../middleware/authMiddleware'
import { getUsers, addUser, updateUser, deleteUser } from '../controllers/userController'

const router = express.Router()

router.get('/', protect, getUsers)
router.post('/add', protect, addUser)
router.put('/:id', protect, updateUser)
router.delete('/:id', protect, deleteUser)

export default router
