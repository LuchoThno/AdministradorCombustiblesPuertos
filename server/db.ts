import mongoose from 'mongoose';
import { config } from './config.js';

const mongoOptions = {
  serverApi: {
    version: '1' as const,
    strict: true,
    deprecationErrors: true,
  },
};

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, mongoOptions);
}

export async function pingDatabase() {
  await connectDatabase();
  await mongoose.connection.db?.admin().command({ ping: 1 });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
