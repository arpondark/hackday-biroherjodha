import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'gfkjkdfhkgjhfdkjghjlfkdhgjkldfglsdfjshfilsuhfisudhfisdffg';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    // Decode the Google JWT credential (no verification needed for development)
    // In production, you should verify the token with Google's public keys
    const decodedToken = jwt.decode(credential);
    
    if (!decodedToken) {
      return res.status(400).json({ error: 'Invalid credential' });
    }

    const { sub: googleId, email, name, picture } = decodedToken;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({
          googleId,
          email,
          name,
          avatar: picture,
          provider: 'google',
        });
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const token_jwt = generateToken(user._id);

    res.json({
      token: token_jwt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});



router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
