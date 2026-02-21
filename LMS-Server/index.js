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


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Mongoose connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('Mongoose connection error:', err);
  });
