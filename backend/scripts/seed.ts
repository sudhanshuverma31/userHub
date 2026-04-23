import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { User } from '../models/User'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/opsore_users'

const seedUsers = [
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', password: 'password123', phone: '9876543210', gender: 'female', country: 'United States' },
  { firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', password: 'password123', phone: '9123456789', gender: 'male', country: 'United Kingdom' },
  { firstName: 'Carol', lastName: 'Williams', email: 'carol@example.com', password: 'password123', phone: '9234567890', gender: 'female', country: 'India' },
  { firstName: 'David', lastName: 'Brown', email: 'david@example.com', password: 'password123', phone: '9345678901', gender: 'male', country: 'Australia' },
  { firstName: 'Eve', lastName: 'Davis', email: 'eve@example.com', password: 'password123', phone: '9456789012', gender: 'female', country: 'Canada' },
  { firstName: 'Frank', lastName: 'Miller', email: 'frank@example.com', password: 'password123', phone: '9567890123', gender: 'male', country: 'Germany' },
  { firstName: 'Grace', lastName: 'Wilson', email: 'grace@example.com', password: 'password123', phone: '9678901234', gender: 'female', country: 'Japan' },
  { firstName: 'Henry', lastName: 'Moore', email: 'henry@example.com', password: 'password123', phone: '9789012345', gender: 'male', country: 'France' },
  { firstName: 'Irene', lastName: 'Taylor', email: 'irene@example.com', password: 'password123', phone: '9890123456', gender: 'female', country: 'Brazil' },
  { firstName: 'Jack', lastName: 'Anderson', email: 'jack@example.com', password: 'password123', phone: '9901234567', gender: 'male', country: 'South Korea' },
  { firstName: 'Karen', lastName: 'Thomas', email: 'karen@example.com', password: 'password123', phone: '9012345678', gender: 'female', country: 'Italy' },
  { firstName: 'Leo', lastName: 'Jackson', email: 'leo@example.com', password: 'password123', phone: '8901234567', gender: 'male', country: 'Spain' },
]

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing users
    await User.deleteMany({})
    console.log('🗑️  Cleared existing users')

    // Hash passwords and insert
    const salt = await bcrypt.genSalt(10)
    const usersWithHash = await Promise.all(
      seedUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, salt),
      }))
    )

    await User.insertMany(usersWithHash)
    console.log(`🌱 Seeded ${usersWithHash.length} users successfully!`)
    console.log('\n📋 Test account credentials:')
    console.log('   Email:    alice@example.com')
    console.log('   Password: password123')
  } catch (err) {
    console.error('❌ Seeding failed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

seed()
