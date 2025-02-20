const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error(`Email already in use: ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    console.log(`User registered successfully: ${username} (${email})`);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Error in Register Route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login Request Body:', req.body);

    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found with email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User Found in DB:', user);

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      console.error('Password does not match for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT if credentials are correct
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT Generated:', token);

    res.status(200).json({ token, userId: user._id, email: user.email });
  } catch (err) {
    console.error('Error in Login Route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
