# Quick Start Guide

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)

## Quick Setup (5 minutes)

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up PostgreSQL:**
   ```bash
   createdb slotswapper
   ```

3. **Configure backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run the application:**
   ```bash
   # From root directory
   npm run dev
   ```

5. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Test the Application

1. Create two user accounts (User A and User B)
2. As User A, create an event and mark it as "Swappable"
3. As User B, create an event and mark it as "Swappable"
4. As User A, go to Marketplace and request a swap with User B's slot
5. As User B, go to Notifications and accept the swap
6. Check both calendars - the slots should now be swapped!

For detailed documentation, see [README.md](./README.md).
