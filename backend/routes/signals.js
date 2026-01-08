import express from 'express';
import jwt from 'jsonwebtoken';
import EmotionalSignal from '../models/EmotionalSignal.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'gfkjkdfhkgjhfdkjghjlfkdhgjkldfglsdfjshfilsuhfisudhfisdffg';

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

router.get('/', authMiddleware, async (req, res) => {
  try {
    const signals = await EmotionalSignal.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(30);
    res.json(signals);
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// Global Feed
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const signals = await EmotionalSignal.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'avatar'); // Only fetch avatar, no name/text
    res.json(signals);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { color, motion, intensity, silenceDuration } = req.body;

    const signal = await EmotionalSignal.create({
      userId: req.userId,
      color,
      motion,
      intensity,
      silenceDuration,
    });

    res.status(201).json(signal);
  } catch (error) {
    console.error('Error creating signal:', error);
    res.status(500).json({ error: 'Failed to create signal' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const signal = await EmotionalSignal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!signal) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    res.json({ message: 'Signal deleted' });
  } catch (error) {
    console.error('Error deleting signal:', error);
    res.status(500).json({ error: 'Failed to delete signal' });
  }
});

export default router;
