const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Password should be hashed
  totalCarbonFootprint: { type: Number, default: 0 }  // Add this line for total carbon footprint
});

module.exports = mongoose.model('User', UserSchema);
