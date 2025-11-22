/**
 * Application Routes
 */

import { Application, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function setupRoutes(app: Application): void {
  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'doctors-linc',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API info endpoint
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      name: 'Doctors-Linc API',
      version: '0.1.0',
      description: 'AI-powered OCR pipeline for healthcare document processing',
      endpoints: {
        health: '/health',
        ocr: '/api/v1/ocr',
        documents: '/api/v1/documents',
        fhir: '/api/v1/fhir',
        translation: '/api/v1/translation',
      },
    });
  });

  // API v1 routes (to be implemented)
  app.use('/api/v1/ocr', (req: Request, res: Response) => {
    res.json({ message: 'OCR endpoints coming soon', path: req.path });
  });

  app.use('/api/v1/documents', (req: Request, res: Response) => {
    res.json({ message: 'Document endpoints coming soon', path: req.path });
  });

  app.use('/api/v1/fhir', (req: Request, res: Response) => {
    res.json({ message: 'FHIR endpoints coming soon', path: req.path });
  });

  app.use('/api/v1/translation', (req: Request, res: Response) => {
    res.json({ message: 'Translation endpoints coming soon', path: req.path });
  });

  logger.info('✅ Routes setup complete');
}
