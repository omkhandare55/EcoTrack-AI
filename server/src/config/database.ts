import mongoose from 'mongoose';
import { env } from './env';
import { seedDatabase } from '../seeds/dbSeeder';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

export async function connectDatabase(): Promise<void> {
  let retries = 0;

  mongoose.connection.on('connected', () => {
    console.error(`✅  MongoDB connected: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error(`❌  MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('⚠️  MongoDB disconnected');
  });

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.error(`\n${signal} received – closing MongoDB connection…`);
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3_000,
        socketTimeoutMS: 45_000,
      });

      // Seed default challenges if needed
      await seedDatabase();

      return;
    } catch (err) {
      retries += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌  MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${message}`);

      if (retries >= MAX_RETRIES) {
        if (env.NODE_ENV === 'development') {
          console.error(
            '⚠️  Failed to connect to local MongoDB. Attempting failover to in-memory MongoDB Server...',
          );
          try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            console.error(`🌱  In-memory MongoDB Server started at: ${uri}`);
            await mongoose.connect(uri);
            await seedDatabase();
            return;
          } catch (memDbErr) {
            console.error('❌  Failover to in-memory MongoDB Server failed:', memDbErr);
            process.exit(1);
          }
        } else {
          console.error('❌  Maximum MongoDB connection retries reached – exiting');
          process.exit(1);
        }
      }

      console.error(`⏳  Retrying in ${RETRY_DELAY_MS / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
