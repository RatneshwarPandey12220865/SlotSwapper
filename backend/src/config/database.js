import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Build MongoDB connection string
let MONGODB_URI = process.env.MONGODB_URI;

// If MONGODB_URI is not set, construct it from components
if (!MONGODB_URI) {
  const username = process.env.DB_USER || 'chamanpandey51';
  const password = process.env.DB_PASSWORD || '';
  const cluster = process.env.DB_CLUSTER || 'cluster0.sjthf5j.mongodb.net';
  const dbName = process.env.DB_NAME || 'slotswapper';
  
  // URL encode the password to handle special characters
  const encodedPassword = encodeURIComponent(password);
  
  MONGODB_URI = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
} else {
  // Replace <db_password> placeholder if it exists in the connection string
  const password = process.env.DB_PASSWORD || '';
  if (password) {
    const encodedPassword = encodeURIComponent(password);
    MONGODB_URI = MONGODB_URI.replace('<db_password>', encodedPassword);
  }
}

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
    });
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Connection string format:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    process.exit(-1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

export default mongoose;
