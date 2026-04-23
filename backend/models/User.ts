import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // optional if created via dashboard add user
    phone: { type: String, required: false },
    gender: { type: String, required: false, default: 'unknown' },
    country: { type: String, required: false },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
