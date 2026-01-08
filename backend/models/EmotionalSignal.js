import mongoose from 'mongoose';

const emotionalSignalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  color: { type: String, required: true },
  motion: { type: String, enum: ['wave', 'swirl', 'pulse', 'ripple'], required: true },
  intensity: { type: Number, required: true, min: 0, max: 100 },
  silenceDuration: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('EmotionalSignal', emotionalSignalSchema);
