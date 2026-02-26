require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const instructorRoutes = require('./routes/instructor');
const courseRoutes = require('./routes/course');
const transactionRoutes = require('./routes/transaction');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const USER_DB = process.env.USER_DB;
const USERPASS = process.env.USERPASS;

const MONGO_URI = `mongodb+srv://${USER_DB}:${USERPASS}@cluster0.rdbtijm.mongodb.net/TeachingManager?retryWrites=true&w=majority`;

// Mongoose connection options with better error handling
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);


mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('Mongoose connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('Mongoose connection error:', err.message);
    console.error('\n🔗 MONGODB CONNECTION TROUBLESHOOTING:');
    console.error('1. Check your MongoDB Atlas IP whitelist: https://cloud.mongodb.com');
    console.error('2. Add your current IP address to Network Access');
    console.error('3. Verify USER_DB and USERPASS in .env file');
    console.error('4. Check internet connection');
    process.exit(1);
  });
