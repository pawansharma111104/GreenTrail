const express = require('express');
const router = express.Router();
const Activity = require('../models/activity'); // Import the Activity model
const mongoose = require('mongoose'); // Import mongoose for ObjectId

// POST route to save activity data
router.post('/save', async (req, res) => {
  const { fromDate, toDate, transportData, houseData, lifestyleData, carbonFootprint, userId } = req.body;

  try {
    // Validate required fields
    if (!fromDate || !toDate || !transportData || !houseData || !lifestyleData || !carbonFootprint || !userId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert userId to ObjectId before saving
    const validUserId = new mongoose.Types.ObjectId(userId); // Use new to create the ObjectId

    // Create a new activity instance
    const newActivity = new Activity({
      userId: validUserId,  // Use the valid ObjectId
      fromDate,
      toDate,
      transportation: transportData.distance,
      diet: lifestyleData.diet,
      energy: houseData.energyUsage,
      totalEmission: carbonFootprint,
    });

    // Save activity to the database
    await newActivity.save();
    res.status(201).json({ message: 'Activity saved successfully!' });
  } catch (err) {
    console.error('Error saving activity:', err);
    res.status(500).json({ message: 'Error saving activity', error: err.message });
  }
});

// Get activities by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params
    console.log('Received userId:', userId); // Debugging log
    
    // Validate userId format
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    // Find activities for the given userId
    const activities = await Activity.find({ userId });

    if (activities.length === 0) {
      return res.status(404).json({ message: 'No activities found' });
    }

    // Return the activities
    res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});
// Route to fetch carbon footprint data for graphing
router.get('/footprint/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Fetch activities for the given userId and sort by fromDate
    const activities = await Activity.find({ userId }).sort({ fromDate: 1 });

    if (!activities.length) {
      return res.status(404).json({ message: 'No activities found for this user' });
    }

    // Prepare the graph data
    const labels = activities.map(activity => new Date(activity.fromDate).toLocaleDateString());
    const values = activities.map(activity => activity.totalEmission); // Assuming 'totalEmission' is the carbon footprint

    // Respond with the graph data
    res.json({ labels, values });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving data for graph' });
  }
});
module.exports = router;