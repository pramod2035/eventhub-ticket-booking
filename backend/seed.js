const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Assuming you have created User, Event, and Seat models in src/models/
const User = require('./src/models/User');
const Event = require('./src/models/Event');
const Seat = require('./src/models/Seat');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database. Clearing old data...');
    
    await User.deleteMany({});
    await Event.deleteMany({});
    await Seat.deleteMany({});

    // 1. Create Dummy Admin & User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@taski.in',
      password: hashedPassword,
      role: 'ADMIN',
      walletBalance: 0
    });

    const user = await User.create({
      name: 'Pramod Bhat',
      email: 'pramod@test.com',
      password: hashedPassword,
      role: 'USER',
      walletBalance: 500000 // 5000.00 in paise
    });

    // 2. Create Dummy Event
    const event = await Event.create({
      title: 'Full Stack Developer Conference 2026',
      description: 'Annual tech meetup focusing on MERN stack scaling and Web3.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      location: 'Tech Park Auditorium, Bengaluru',
      ticketPrice: 150000 // 1500.00 in paise[cite: 1]
    });

    // 3. Bulk Create Seats (Admin capability requested in PDF)[cite: 1]
    const seats = [];
    for (let i = 1; i <= 20; i++) {
      seats.push({
        eventId: event._id,
        seatNumber: `A${i}`,
        status: i % 5 === 0 ? 'BOOKED' : 'AVAILABLE' // Pre-book every 5th seat for realism
      });
    }
    await Seat.insertMany(seats);

    console.log('Database successfully seeded!');
    console.log('Admin Login: admin@taski.in / password123');
    console.log('User Login: pramod@test.com / password123');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();