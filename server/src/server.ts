import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('💥  UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Start DB connection
connectDatabase().then(() => {
  const server = app.listen(env.PORT, () => {
    console.error(`🚀  Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error('💥  UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    server.close(() => {
      process.exit(1);
    });
  });
});
