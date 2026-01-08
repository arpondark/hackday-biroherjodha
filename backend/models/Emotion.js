import mongoose from 'mongoose';

const emotionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  color: { 
    type: String, 
    required: true 
  },
  pattern: { 
    type: String, 
    enum: ['waves', 'particles', 'spirals', 'ripples', 'circles', 'flow', 'pulse'], 
    required: true 
  },
  motionIntensity: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 1 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Index for faster queries
emotionSchema.index({ createdAt: -1 });
emotionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Emotion', emotionSchema);
