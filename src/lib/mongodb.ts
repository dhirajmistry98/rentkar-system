// src/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentkar'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface MongoConnection {
  client: MongoClient
  db: Db
}

let cached: MongoConnection | null = null

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached) {
    return cached
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    await client.connect()
    const db = client.db()
    
    // Create indexes if they don't exist
    await createIndexes(db)
    
    cached = { client, db }
    console.log('✅ Connected to MongoDB')
    
    return cached
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

async function createIndexes(db: Db) {
  try {
    // Partners collection indexes
    await db.collection('partners').createIndex({ "location": "2dsphere" })
    await db.collection('partners').createIndex({ "city": 1, "status": 1 })
    
    // Bookings collection indexes  
    await db.collection('bookings').createIndex({ "createdAt": -1 })
    await db.collection('bookings').createIndex({ "status": 1 })
    await db.collection('bookings').createIndex({ "location": 1 })
    await db.collection('bookings').createIndex({ "partnerId": 1 })
    
    console.log('📊 Database indexes created')
  } catch (error) {
    console.error('Index creation error:', error)
  }
}

// Mongoose connection for advanced queries
export async function connectMongoose() {
  if (mongoose.connections[0].readyState) {
    return mongoose.connection
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Mongoose connected')
    return mongoose.connection
  } catch (error) {
    console.error('❌ Mongoose connection error:', error)
    throw error
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (cached) {
    await cached.client.close()
    console.log('📴 MongoDB connection closed')
  }
  if (mongoose.connections[0].readyState) {
    await mongoose.connection.close()
    console.log('📴 Mongoose connection closed')
  }
  process.exit(0)
})