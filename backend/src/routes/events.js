import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { authenticateToken } from '../middleware/auth.js';
import { cache } from '../config/redis.js';
import { z } from 'zod';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  status: z.enum(['BUSY', 'SWAPPABLE', 'SWAP_PENDING']).optional(),
});

// Cache TTL in seconds (15 minutes)
const CACHE_TTL = 900;

// GET /api/events - Get all events for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const cacheKey = `events:user:${userId}`;

    // Try to get from cache
    const cachedEvents = await cache.get(cacheKey);
    if (cachedEvents) {
      return res.json(cachedEvents);
    }

    // If not in cache, fetch from database
    const events = await Event.find({ user_id: userId }).sort({ start_time: 1 });

    // Cache the result
    await cache.set(cacheKey, events, CACHE_TTL);

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/:id - Get a specific event
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const cacheKey = `event:${eventId}:user:${userId}`;

    // Try to get from cache
    const cachedEvent = await cache.get(cacheKey);
    if (cachedEvent) {
      return res.json(cachedEvent);
    }

    // If not in cache, fetch from database
    const event = await Event.findOne({ _id: eventId, user_id: userId });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Cache the result
    await cache.set(cacheKey, event, CACHE_TTL);

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events - Create a new event
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { title, startTime, endTime, status = 'BUSY' } = eventSchema.parse(req.body);

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const event = await Event.create({
      user_id: userId,
      title,
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      status,
    });

    // Invalidate user's events cache
    await cache.del(`events:user:${userId}`);
    // Also invalidate swappable slots cache if status is SWAPPABLE
    if (status === 'SWAPPABLE') {
      await cache.delPattern('swappable-slots:*');
    }

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/events/:id - Update an event
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;
    const { title, startTime, endTime, status } = eventSchema.partial().parse(req.body);

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists and belongs to user
    const existingEvent = await Event.findOne({ _id: eventId, user_id: userId });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (startTime !== undefined) updateData.start_time = new Date(startTime);
    if (endTime !== undefined) updateData.end_time = new Date(endTime);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Validate time if both are being updated
    const finalStartTime = startTime ? new Date(startTime) : existingEvent.start_time;
    const finalEndTime = endTime ? new Date(endTime) : existingEvent.end_time;
    if (finalEndTime <= finalStartTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const event = await Event.findOneAndUpdate(
      { _id: eventId, user_id: userId },
      updateData,
      { new: true, runValidators: true }
    );

    // Invalidate caches
    await cache.del(`event:${eventId}:user:${userId}`);
    await cache.del(`events:user:${userId}`);
    // Invalidate swappable slots if status changed
    if (status !== undefined || existingEvent.status === 'SWAPPABLE') {
      await cache.delPattern('swappable-slots:*');
    }

    res.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id - Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findOneAndDelete({ _id: eventId, user_id: userId });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Invalidate caches
    await cache.del(`event:${eventId}:user:${userId}`);
    await cache.del(`events:user:${userId}`);
    // Invalidate swappable slots if deleted event was swappable
    if (event.status === 'SWAPPABLE') {
      await cache.delPattern('swappable-slots:*');
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
