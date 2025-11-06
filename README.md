# SlotSwapper

SlotSwapper is a peer-to-peer time-slot scheduling application that allows users to swap their busy calendar slots with other users. Users can mark their busy slots as "swappable," browse available slots from other users, and request swaps. When a swap is accepted, both users' calendars are automatically updated.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Calendar Management**: Create, edit, and delete events with different statuses (BUSY, SWAPPABLE, SWAP_PENDING)
- **Marketplace**: Browse and discover swappable slots from other users
- **Swap Requests**: Create swap requests and respond to incoming requests
- **Real-time Updates**: Dynamic state management ensures UI updates without manual refresh
- **Protected Routes**: Authentication required for all protected pages

## 🛠️ Technology Stack

### Frontend
- **React 18** (JavaScript)
- **React Router** for navigation
- **Zustand** for state management
- **Vite** for build tooling
- **Axios** for API calls

### Backend
- **Node.js** with **Express** (JavaScript, ES Modules)
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd slotswapper
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install-all
```

Or install them separately:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

1. **Create a PostgreSQL database**:

```bash
# Using psql
createdb slotswapper

# Or using SQL
psql -U postgres
CREATE DATABASE slotswapper;
```

2. **Configure database connection**:

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slotswapper
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Run the Application

#### Option 1: Run Both Frontend and Backend Together

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/health`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Events Endpoints

All event endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

#### GET `/api/events`
Get all events for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Team Meeting",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "status": "BUSY",
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-10T08:00:00Z"
  }
]
```

#### GET `/api/events/:id`
Get a specific event by ID.

#### POST `/api/events`
Create a new event.

**Request Body:**
```json
{
  "title": "Team Meeting",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "status": "BUSY"
}
```

#### PUT `/api/events/:id`
Update an existing event.

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Meeting",
  "startTime": "2024-01-15T11:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "status": "SWAPPABLE"
}
```

#### DELETE `/api/events/:id`
Delete an event.

### Swap Endpoints

All swap endpoints require authentication.

#### GET `/api/swappable-slots`
Get all swappable slots from other users (excludes your own slots).

**Response:**
```json
[
  {
    "id": 2,
    "user_id": 2,
    "title": "Focus Block",
    "start_time": "2024-01-16T14:00:00Z",
    "end_time": "2024-01-16T15:00:00Z",
    "status": "SWAPPABLE",
    "owner_name": "Jane Doe",
    "owner_email": "jane@example.com"
  }
]
```

#### POST `/api/swap-request`
Create a swap request.

**Request Body:**
```json
{
  "mySlotId": 1,
  "theirSlotId": 2
}
```

**Response:**
```json
{
  "message": "Swap request created successfully",
  "swapRequest": {
    "id": 1,
    "requester_id": 1,
    "requestee_id": 2,
    "requester_slot_id": 1,
    "requestee_slot_id": 2,
    "status": "PENDING"
  }
}
```

#### POST `/api/swap-response/:requestId`
Respond to a swap request (accept or reject).

**Request Body:**
```json
{
  "accepted": true
}
```

#### GET `/api/swap-requests`
Get all swap requests (incoming and outgoing).

**Response:**
```json
{
  "incoming": [
    {
      "id": 1,
      "requester_id": 2,
      "requestee_id": 1,
      "requester_slot_id": 3,
      "requestee_slot_id": 1,
      "status": "PENDING",
      "requester_name": "Jane Doe",
      "requester_slot_title": "Focus Block",
      "requestee_slot_title": "Team Meeting"
    }
  ],
  "outgoing": []
}
```

## 🗄️ Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, hashed)
- `created_at` (TIMESTAMP)

### Events Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, REFERENCES users)
- `title` (VARCHAR)
- `start_time` (TIMESTAMP)
- `end_time` (TIMESTAMP)
- `status` (ENUM: BUSY, SWAPPABLE, SWAP_PENDING)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### SwapRequests Table
- `id` (SERIAL PRIMARY KEY)
- `requester_id` (INTEGER, REFERENCES users)
- `requestee_id` (INTEGER, REFERENCES users)
- `requester_slot_id` (INTEGER, REFERENCES events)
- `requestee_slot_id` (INTEGER, REFERENCES events)
- `status` (ENUM: PENDING, ACCEPTED, REJECTED)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🎨 Design Choices

1. **Database**: PostgreSQL was chosen for its reliability, ACID compliance, and support for complex relationships.

2. **State Management**: Zustand was selected for its simplicity and lightweight nature compared to Redux, while still providing persistence capabilities.

3. **Authentication**: JWT tokens stored in localStorage for client-side persistence, with automatic token validation on API requests.

4. **Swap Logic**: The core swap logic uses database transactions to ensure data consistency. When a swap is accepted:
   - Both slots' `user_id` fields are swapped
   - Both slots' statuses are set to `BUSY`
   - The swap request is marked as `ACCEPTED`

5. **Status Management**: Events have three states:
   - `BUSY`: Regular event, not available for swapping
   - `SWAPPABLE`: Available for swapping
   - `SWAP_PENDING`: Currently involved in a pending swap request

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes with middleware
- Input validation with Zod
- SQL injection prevention with parameterized queries

## 🧪 Testing the Application

### Manual Testing Flow

1. **Create Accounts**: Sign up with two different users (e.g., User A and User B)

2. **Create Events**: 
   - As User A, create an event and mark it as "Swappable"
   - As User B, create an event and mark it as "Swappable"

3. **Request Swap**:
   - As User A, go to Marketplace and request a swap with User B's slot
   - Select your swappable slot to offer

4. **Respond to Swap**:
   - As User B, go to Notifications page
   - Accept or reject the swap request

5. **Verify Swap**:
   - After acceptance, check both users' calendars
   - The slots should now belong to the other user

## 🚧 Challenges Faced

1. **Transaction Management**: Ensuring atomic operations when swapping slots required careful transaction handling in PostgreSQL.

2. **State Synchronization**: Keeping the frontend state in sync with backend changes required careful API call management and state updates.

3. **Status Management**: Preventing race conditions where multiple users try to swap the same slot required status checks and locking mechanisms.

## 📝 Assumptions Made

1. **Time Zones**: All times are stored and displayed in UTC. In production, timezone handling would need to be implemented.

2. **Slot Validation**: The application assumes that slots don't overlap when swapping. In production, additional validation would be needed.

3. **Single Swap per Slot**: Only one pending swap request is allowed per slot at a time.

4. **No Recurring Events**: Events are single-instance only. No recurring event support.

## 🚀 Future Enhancements

- **Real-time Notifications**: WebSocket integration for instant notifications
- **Email Notifications**: Email alerts for swap requests
- **Calendar Integration**: Sync with Google Calendar, Outlook, etc.
- **Advanced Search**: Filter swappable slots by date range, duration, etc.
- **Swap History**: Track completed swaps
- **User Profiles**: Enhanced user profiles with preferences
- **Mobile App**: React Native mobile application

## 📄 License

This project is created for the ServiceHive Full Stack Intern position technical challenge.

## 👤 Author

Created as part of the ServiceHive technical challenge.

---

**Note**: This is a demonstration project. For production use, additional security measures, error handling, and testing would be required.
