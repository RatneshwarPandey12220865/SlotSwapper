import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requester_slot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  requestee_slot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
    required: true,
  },
}, {
  timestamps: true,
});

// Create indexes
swapRequestSchema.index({ requester_id: 1 });
swapRequestSchema.index({ requestee_id: 1 });

export default mongoose.model('SwapRequest', swapRequestSchema);

