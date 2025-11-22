/**
 * Doctors-Linc Main Entry Point
 * AI-powered OCR pipeline for healthcare document processing
 */

import 'reflect-metadata';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import { logger } from './utils/logger';
import { config } from './config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';

// Load environment variables
dotenv.config();

class DoctorsLincServer {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
  }

  /**
   * Initialize the server
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('🏥 Initializing Doctors-Linc server...');

      // Initialize services
      await this.initializeServices();

      // Setup middleware
      setupMiddleware(this.app);

      // Setup routes
      setupRoutes(this.app);

      // Error handling
      this.setupErrorHandling();

      logger.info('✅ Server initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize server:', error);
      throw error;
    }
  }

  /**
   * Initialize database and cache services
   */
  private async initializeServices(): Promise<void> {
    try {
      // Initialize PostgreSQL
      const dbService = DatabaseService.getInstance();
      await dbService.connect();
      logger.info('✅ Database connected');

      // Initialize Redis
      const redisService = RedisService.getInstance();
      await redisService.connect();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });

    // Global error handler
    this.app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: config.isDevelopment ? err.message : 'Something went wrong',
      });
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this.initialize();

      this.app.listen(this.port, () => {
        logger.info(`🚀 Doctors-Linc server running on port ${this.port}`);
        logger.info(`📚 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 API: http://localhost:${this.port}`);
        logger.info(`📖 Health: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down Doctors-Linc server...');

    try {
      // Close database connection
      const dbService = DatabaseService.getInstance();
      await dbService.disconnect();

      // Close Redis connection
      const redisService = RedisService.getInstance();
      await redisService.disconnect();

      logger.info('✅ Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new DoctorsLincServer();

// Handle shutdown signals
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Start the server
server.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

export default server;
