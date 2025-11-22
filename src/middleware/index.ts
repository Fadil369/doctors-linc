/**
 * Express Middleware Setup
 */

import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../utils/logger';

export function setupMiddleware(app: Application): void {
  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.isDevelopment ? '*' : process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Request logging
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  logger.info('✅ Middleware setup complete');
}
