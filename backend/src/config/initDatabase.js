import { connectDatabase } from './database.js';

export async function initDatabase() {
  try {
    await connectDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
