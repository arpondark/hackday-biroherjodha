import express from 'express';
import jwt from 'jsonwebtoken';
import Emotion from '../models/Emotion.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'gfkjkdfhkgjhfdkjghjlfkdhgjkldfglsdfjshfilsuhfisudhfisdffg';

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create emotion post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { color, pattern, motionIntensity } = req.body;

    // Validate required fields
    if (!color || !pattern || motionIntensity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emotion = await Emotion.create({
      userId: req.userId,
      color,
      pattern,
      motionIntensity,
    });

    // Populate user data for response
    await emotion.populate('userId', 'name avatar');

    res.status(201).json({
      id: emotion._id,
      userId: emotion.userId._id,
      color: emotion.color,
      pattern: emotion.pattern,
      motionIntensity: emotion.motionIntensity,
      createdAt: emotion.createdAt,
    });
  } catch (error) {
    console.error('Error creating emotion:', error);
    res.status(500).json({ error: 'Failed to create emotion' });
  }
});

// Get emotion feed (public feed of all emotions)
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const emotions = await Emotion.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar');

    const formattedEmotions = emotions.map(emotion => ({
      id: emotion._id,
      userId: emotion.userId._id,
      color: emotion.color,
      pattern: emotion.pattern,
      motionIntensity: emotion.motionIntensity,
      createdAt: emotion.createdAt,
    }));

    res.json(formattedEmotions);
  } catch (error) {
    console.error('Error fetching emotion feed:', error);
    res.status(500).json({ error: 'Failed to fetch emotion feed' });
  }
});

// Get user's emotion history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const emotions = await Emotion.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name avatar');

    const formattedEmotions = emotions.map(emotion => ({
      id: emotion._id,
      userId: emotion.userId._id,
      color: emotion.color,
      pattern: emotion.pattern,
      motionIntensity: emotion.motionIntensity,
      createdAt: emotion.createdAt,
    }));

    res.json(formattedEmotions);
  } catch (error) {
    console.error('Error fetching emotion history:', error);
    res.status(500).json({ error: 'Failed to fetch emotion history' });
  }
});

// Get single emotion by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const emotion = await Emotion.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!emotion) {
      return res.status(404).json({ error: 'Emotion not found' });
    }

    res.json({
      id: emotion._id,
      userId: emotion.userId._id,
      color: emotion.color,
      pattern: emotion.pattern,
      motionIntensity: emotion.motionIntensity,
      createdAt: emotion.createdAt,
      user: emotion.userId // Send full user object for display if needed
    });
  } catch (error) {
    console.error('Error fetching emotion:', error);
    res.status(500).json({ error: 'Failed to fetch emotion' });
  }
});

// Delete emotion (user can only delete their own)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const emotion = await Emotion.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!emotion) {
      return res.status(404).json({ error: 'Emotion not found or unauthorized' });
    }

    res.json({ message: 'Emotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting emotion:', error);
    res.status(500).json({ error: 'Failed to delete emotion' });
  }
});

export default router;
