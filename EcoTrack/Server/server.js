const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  
const calculateRoutes = require('./routes/calculateRoutes');  
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Load environment variables
dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);  // Debugging env file

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
if (authRoutes) {
  app.use('/api/auth', authRoutes);
} else {
  console.error("authRoutes is not correctly imported.");
}

// Carbon Footprint Routes
if (calculateRoutes) {
  app.use('/api', calculateRoutes);
} else {
  console.error("calculateRoutes is not correctly imported.");
}

// Activity Routes
if (activityRoutes) {
  app.use('/api/activities', activityRoutes);
} else {
  console.error("activityRoutes is not correctly imported.");
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
  