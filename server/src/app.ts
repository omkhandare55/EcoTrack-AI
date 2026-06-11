import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, AppError } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// 1. Helmet for security headers
app.use(helmet());

// 2. CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// 3. Request Logging (morgan)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting for API routes
app.use('/api', apiLimiter);

// 5. Body parser with limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Cookie Parser
app.use(cookieParser(env.COOKIE_SECRET));

// 7. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 8. Main API Routes
app.use('/api/v1', routes);

// 9. Handle unhandled routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 10. Global Error Handler
app.use(globalErrorHandler);

export default app;
