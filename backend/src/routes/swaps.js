import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { cache } from '../config/redis.js';
import { z } from 'zod';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Cache TTL in seconds (10 minutes for swap-related data)
const CACHE_TTL = 600;

// GET /api/swappable-slots - Get all swappable slots from other users
router.get('/swappable-slots', async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `swappable-slots:user:${userId}`;

    // Try to get from cache
    const cachedSlots = await cache.get(cacheKey);
    if (cachedSlots) {
      return res.json(cachedSlots);
    }

    // If not in cache, fetch from database
    const slots = await Event.find({
      status: 'SWAPPABLE',
      user_id: { $ne: userId },
    })
      .populate('user_id', 'name email')
      .sort({ start_time: 1 });

    // Transform to match expected format
    const formattedSlots = slots.map((slot) => ({
      ...slot.toObject(),
      owner_name: slot.user_id.name,
      owner_email: slot.user_id.email,
      user_id: slot.user_id._id,
    }));

    // Cache the result
    await cache.set(cacheKey, formattedSlots, CACHE_TTL);

    res.json(formattedSlots);
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/swap-request - Create a swap request
router.post('/swap-request', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.userId;

    const { mySlotId: rawMySlotId, theirSlotId: rawTheirSlotId } = req.body;
    
    // Convert to strings if numbers
    const mySlotId = String(rawMySlotId);
    const theirSlotId = String(rawTheirSlotId);

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(mySlotId) || !mongoose.Types.ObjectId.isValid(theirSlotId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid slot ID' });
    }

    // Verify both slots exist and are SWAPPABLE
    const mySlot = await Event.findOne({
      _id: mySlotId,
      user_id: userId,
      status: 'SWAPPABLE',
    }).session(session);

    if (!mySlot) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Your slot not found or not swappable',
      });
    }

    const theirSlot = await Event.findOne({
      _id: theirSlotId,
      status: 'SWAPPABLE',
    }).session(session);

    if (!theirSlot) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Target slot not found or not swappable',
      });
    }

    // Prevent self-swap
    if (theirSlot.user_id.toString() === userId) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Cannot swap with your own slot',
      });
    }

    // Check if there's already a pending swap request for either slot
    const existingSwap = await SwapRequest.findOne({
      status: 'PENDING',
      $or: [
        { requester_slot_id: mySlotId },
        { requester_slot_id: theirSlotId },
        { requestee_slot_id: mySlotId },
        { requestee_slot_id: theirSlotId },
      ],
    }).session(session);

    if (existingSwap) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'One or both slots are already involved in a pending swap',
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create(
      [
        {
          requester_id: userId,
          requestee_id: theirSlot.user_id,
          requester_slot_id: mySlotId,
          requestee_slot_id: theirSlotId,
          status: 'PENDING',
        },
      ],
      { session }
    );

    // Update both slots to SWAP_PENDING
    await Event.updateMany(
      { _id: { $in: [mySlotId, theirSlotId] } },
      { status: 'SWAP_PENDING' },
      { session }
    );

    await session.commitTransaction();

    // Invalidate caches
    await cache.del(`swappable-slots:user:${userId}`);
    await cache.del(`swappable-slots:user:${theirSlot.user_id}`);
    await cache.del(`swap-requests:user:${userId}`);
    await cache.del(`swap-requests:user:${theirSlot.user_id}`);
    await cache.del(`events:user:${userId}`);
    await cache.del(`events:user:${theirSlot.user_id}`);

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest: swapRequest[0],
    });
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
});

// POST /api/swap-response/:requestId - Respond to a swap request
router.post('/swap-response/:requestId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const requestId = req.params.requestId;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const { accepted } = z.object({
      accepted: z.boolean(),
    }).parse(req.body);

    // Get the swap request
    const swapRequest = await SwapRequest.findById(requestId).session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify the user is the requestee (the one receiving the request)
    if (swapRequest.requestee_id.toString() !== userId) {
      await session.abortTransaction();
      return res.status(403).json({
        error: 'You are not authorized to respond to this swap request',
      });
    }

    // Check if already responded
    if (swapRequest.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Swap request has already been responded to',
      });
    }

    const requesterId = swapRequest.requester_id.toString();

    if (accepted) {
      // ACCEPT: Swap the owners of the slots
      const requesterSlot = await Event.findById(swapRequest.requester_slot_id).session(session);
      const requesteeSlot = await Event.findById(swapRequest.requestee_slot_id).session(session);

      if (!requesterSlot || !requesteeSlot) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'One or both slots no longer exist' });
      }

      // Swap the user_ids
      await Event.updateOne(
        { _id: swapRequest.requester_slot_id },
        { user_id: swapRequest.requestee_id, status: 'BUSY' },
        { session }
      );
      await Event.updateOne(
        { _id: swapRequest.requestee_slot_id },
        { user_id: swapRequest.requester_id, status: 'BUSY' },
        { session }
      );

      // Update swap request status
      await SwapRequest.updateOne(
        { _id: requestId },
        { status: 'ACCEPTED' },
        { session }
      );
    } else {
      // REJECT: Set swap request to REJECTED and revert slots to SWAPPABLE
      await Event.updateMany(
        {
          _id: { $in: [swapRequest.requester_slot_id, swapRequest.requestee_slot_id] },
        },
        { status: 'SWAPPABLE' },
        { session }
      );

      await SwapRequest.updateOne(
        { _id: requestId },
        { status: 'REJECTED' },
        { session }
      );
    }

    await session.commitTransaction();

    // Invalidate caches for both users
    await cache.del(`swap-requests:user:${userId}`);
    await cache.del(`swap-requests:user:${requesterId}`);
    await cache.del(`swappable-slots:user:${userId}`);
    await cache.del(`swappable-slots:user:${requesterId}`);
    await cache.del(`events:user:${userId}`);
    await cache.del(`events:user:${requesterId}`);

    res.json({
      message: `Swap request ${accepted ? 'accepted' : 'rejected'} successfully`,
    });
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Swap response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
});

// GET /api/swap-requests - Get all swap requests (incoming and outgoing)
router.get('/swap-requests', async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `swap-requests:user:${userId}`;

    // Try to get from cache
    const cachedRequests = await cache.get(cacheKey);
    if (cachedRequests) {
      return res.json(cachedRequests);
    }

    // If not in cache, fetch from database
    // Get incoming requests (where user is the requestee)
    const incoming = await SwapRequest.find({ requestee_id: userId })
      .populate('requester_id', 'name email')
      .populate('requester_slot_id', 'title start_time end_time')
      .populate('requestee_slot_id', 'title start_time end_time')
      .sort({ created_at: -1 });

    // Get outgoing requests (where user is the requester)
    const outgoing = await SwapRequest.find({ requester_id: userId })
      .populate('requestee_id', 'name email')
      .populate('requester_slot_id', 'title start_time end_time')
      .populate('requestee_slot_id', 'title start_time end_time')
      .sort({ created_at: -1 });

    // Transform to match expected format
    const formatSwapRequest = (req) => ({
      ...req.toObject(),
      requester_name: req.requester_id?.name,
      requester_email: req.requester_id?.email,
      requestee_name: req.requestee_id?.name,
      requestee_email: req.requestee_id?.email,
      requester_slot_title: req.requester_slot_id?.title,
      requester_slot_start: req.requester_slot_id?.start_time,
      requester_slot_end: req.requester_slot_id?.end_time,
      requestee_slot_title: req.requestee_slot_id?.title,
      requestee_slot_start: req.requestee_slot_id?.start_time,
      requestee_slot_end: req.requestee_slot_id?.end_time,
    });

    const result = {
      incoming: incoming.map(formatSwapRequest),
      outgoing: outgoing.map(formatSwapRequest),
    };

    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL);

    res.json(result);
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
