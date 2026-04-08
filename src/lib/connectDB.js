import mongoose from 'mongoose';

export default async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI missing');
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri);
  console.log('Mongo connected');
}
