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

async function mongoPingTest() {
  const client = new MongoClient(MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Ping successful: Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("MongoDB Ping Error:", error);
  } finally {
    await client.close();
  }
}
mongoPingTest();

// ---------- Register Routes (ONLY ONCE!) ----------
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/courses', courseRoutes);

// ---------- Mongoose Connection ----------
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
