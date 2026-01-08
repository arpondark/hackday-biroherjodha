import dotenv from 'dotenv';

// CRITICAL: Load environment variables FIRST before importing anything else
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import signalRoutes from './routes/signals.js';
import userRoutes from './routes/users.js';
import emotionRoutes from './routes/emotions.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Silent Signal API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emotions', emotionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
