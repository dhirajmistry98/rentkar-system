const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentkar'

const sampleBookings = [
  {
    _id: "687761e7c5bc4044c6d75cb3",
    userId: "68108f18d1224f8f22316a7b",
    packageId: "685612cd3225791ecbb86b6e",
    startDate: new Date("2025-07-19T00:00:00.000Z"),
    endDate: new Date("2025-07-20T00:00:00.000Z"),
    isSelfPickup: false,
    location: "mumbai",
    deliveryTime: { startHour: 12, endHour: 14 },
    selectedPlan: { duration: 1, price: 590 },
    priceBreakDown: {
      basePrice: 590,
      deliveryCharge: 250,
      grandTotal: 1580.02
    },
    document: [
      {
        docType: "SELFIE",
        docLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        status: "PENDING"
      },
      {
        docType: "SIGNATURE", 
        docLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
        status: "PENDING"
      }
    ],
    address: {
      buildingAreaName: "Pooja Enclave",
      houseNumber: "A/603",
      streetAddress: "Kandivali West, Mumbai",
      zip: "400067",
      latitude: 19.203258,
      longitude: 72.8278919
    },
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "687761e7c5bc4044c6d75cb4", 
    userId: "68108f18d1224f8f22316a7c",
    packageId: "685612cd3225791ecbb86b6f",
    startDate: new Date("2025-07-20T00:00:00.000Z"),
    endDate: new Date("2025-07-21T00:00:00.000Z"),
    isSelfPickup: false,
    location: "mumbai",
    deliveryTime: { startHour: 10, endHour: 12 },
    selectedPlan: { duration: 1, price: 750 },
    priceBreakDown: {
      basePrice: 750,
      deliveryCharge: 300,
      grandTotal: 2100.50
    },
    document: [
      {
        docType: "SELFIE",
        docLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", 
        status: "APPROVED"
      },
      {
        docType: "SIGNATURE",
        docLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
        status: "APPROVED"
      }
    ],
    address: {
      buildingAreaName: "Green Valley",
      houseNumber: "B/204", 
      streetAddress: "Andheri East, Mumbai",
      zip: "400069",
      latitude: 19.1136,
      longitude: 72.8697
    },
    status: "DOCUMENTS_UNDER_REVIEW",
    partnerId: "partner123",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const samplePartners = [
  {
    _id: "partner123",
    name: "Rajesh Kumar",
    city: "mumbai", 
    status: "online",
    location: {
      type: "Point",
      coordinates: [72.8278, 19.2030]
    },
    lastGpsUpdate: new Date(),
    currentBookings: ["687761e7c5bc4044c6d75cb3"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "partner124",
    name: "Amit Sharma",
    city: "mumbai",
    status: "busy", 
    location: {
      type: "Point",
      coordinates: [72.8697, 19.1136]
    },
    lastGpsUpdate: new Date(Date.now() - 300000),
    currentBookings: ["687761e7c5bc4044c6d75cb4"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "partner125", 
    name: "Priya Singh",
    city: "mumbai",
    status: "online",
    location: {
      type: "Point", 
      coordinates: [72.8826, 19.0728]
    },
    lastGpsUpdate: new Date(Date.now() - 60000),
    currentBookings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    
    // Clear existing collections
    console.log('Clearing existing data...')
    await db.collection('bookings').deleteMany({})
    await db.collection('partners').deleteMany({})
    
    // Insert sample data
    console.log('Inserting bookings...')
    await db.collection('bookings').insertMany(sampleBookings)
    console.log(`Inserted ${sampleBookings.length} bookings`)
    
    console.log('Inserting partners...')
    await db.collection('partners').insertMany(samplePartners)
    console.log(`Inserted ${samplePartners.length} partners`)
    
    // Create indexes
    console.log('Creating indexes...')
    await db.collection('partners').createIndex({ "location": "2dsphere" })
    await db.collection('bookings').createIndex({ "createdAt": -1 })
    await db.collection('bookings').createIndex({ "status": 1 })
    await db.collection('partners').createIndex({ "city": 1, "status": 1 })
    
    console.log('✅ Database seeded successfully!')
    console.log('Sample data:')
    console.log(`- ${sampleBookings.length} bookings`)
    console.log(`- ${samplePartners.length} partners`) 
    console.log('- Geospatial indexes created')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('Database connection closed')
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }