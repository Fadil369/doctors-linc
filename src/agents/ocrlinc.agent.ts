/**
 * OCRLINC - Document Processing Agent
 * 
 * Extracts and preprocesses text from medical images and documents.
 */

import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface OCRInput {
  imagePath: string;
  language?: string[];
  detectHandwriting?: boolean;
  enhanceQuality?: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  detectedLanguages: string[];
  metadata: {
    imageSize?: { width: number; height: number };
    processingTime: number;
  };
}

export interface TextBlock {
  text: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'unknown';
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class OCRLincAgent {
  private static instance: OCRLincAgent;
  private visionClient: ImageAnnotatorClient | null = null;

  private constructor() {
    this.initializeVisionClient();
  }

  public static getInstance(): OCRLincAgent {
    if (!OCRLincAgent.instance) {
      OCRLincAgent.instance = new OCRLincAgent();
    }
    return OCRLincAgent.instance;
  }

  /**
   * Initialize Google Cloud Vision client
   */
  private initializeVisionClient(): void {
    try {
      if (config.googleCloud.credentialsPath) {
        this.visionClient = new ImageAnnotatorClient({
          keyFilename: config.googleCloud.credentialsPath,
        });
        logger.info('✅ OCRLINC: Google Cloud Vision client initialized');
      } else if (config.googleCloud.credentialsJson) {
        const credentials = JSON.parse(Buffer.from(config.googleCloud.credentialsJson, 'base64').toString());
        this.visionClient = new ImageAnnotatorClient({
          credentials,
        });
        logger.info('✅ OCRLINC: Google Cloud Vision client initialized from JSON');
      } else {
        logger.warn('⚠️ OCRLINC: No Google Cloud credentials configured');
      }
    } catch (error) {
      logger.error('❌ OCRLINC: Failed to initialize Vision client:', error);
    }
  }

  /**
   * Extract text from medical image
   */
  public async extractText(input: OCRInput): Promise<OCRResult> {
    const startTime = Date.now();
    logger.info(`🔍 OCRLINC: Extracting text from ${input.imagePath}`);

    if (!this.visionClient) {
      throw new Error('Google Cloud Vision client not initialized');
    }

    try {
      // Perform OCR using documentTextDetection
      const [result] = await this.visionClient.documentTextDetection(input.imagePath);
      const fullTextAnnotation = result.fullTextAnnotation;

      if (!fullTextAnnotation) {
        throw new Error('No text detected in image');
      }

      // Extract text blocks
      const blocks = this.extractBlocks(fullTextAnnotation);

      // Calculate average confidence
      const confidence = this.calculateConfidence(fullTextAnnotation);

      // Detect languages
      const detectedLanguages = input.language || ['en'];

      const processingTime = Date.now() - startTime;

      const ocrResult: OCRResult = {
        text: fullTextAnnotation.text || '',
        confidence,
        blocks,
        detectedLanguages,
        metadata: {
          processingTime,
        },
      };

      logger.info(`✅ OCRLINC: Text extracted successfully (confidence: ${(confidence * 100).toFixed(2)}%, ${processingTime}ms)`);

      // Check if confidence meets threshold
      if (confidence < config.ocr.confidenceThreshold) {
        logger.warn(`⚠️ OCRLINC: Low confidence (${(confidence * 100).toFixed(2)}%) below threshold (${(config.ocr.confidenceThreshold * 100).toFixed(2)}%)`);
      }

      return ocrResult;
    } catch (error) {
      logger.error('❌ OCRLINC: Text extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract text blocks from full text annotation
   */
  private extractBlocks(fullTextAnnotation: protos.google.cloud.vision.v1.ITextAnnotation): TextBlock[] {
    const blocks: TextBlock[] = [];

    if (!fullTextAnnotation.pages) {
      return blocks;
    }

    for (const page of fullTextAnnotation.pages) {
      if (!page.blocks) continue;

      for (const block of page.blocks) {
        const text = this.getBlockText(block);
        const confidence = block.confidence || 0;

        blocks.push({
          text,
          type: this.inferBlockType(text),
          confidence,
          boundingBox: this.getBoundingBox(block.boundingBox),
        });
      }
    }

    return blocks;
  }

  /**
   * Get text from a block
   */
  private getBlockText(block: protos.google.cloud.vision.v1.IBlock): string {
    if (!block.paragraphs) return '';

    return block.paragraphs
      .map((paragraph: any) => {
        if (!paragraph.words) return '';
        return paragraph.words
          .map((word: any) => {
            if (!word.symbols) return '';
            return word.symbols.map((symbol: any) => symbol.text).join('');
          })
          .join(' ');
      })
      .join('\n');
  }

  /**
   * Infer block type from text content
   */
  private inferBlockType(text: string): TextBlock['type'] {
    // Simple heuristics for block type detection
    if (text.match(/^#{1,6}\s/)) return 'heading';
    if (text.match(/^[*\-+]\s/)) return 'list';
    if (text.match(/\|.*\|/)) return 'table';
    if (text.length < 50 && text.match(/^[A-Z]/)) return 'heading';
    return 'paragraph';
  }

  /**
   * Get bounding box coordinates
   */
  private getBoundingBox(
    boundingBox?: protos.google.cloud.vision.v1.IBoundingPoly | null
  ): TextBlock['boundingBox'] {
    if (!boundingBox?.vertices || boundingBox.vertices.length < 2) {
      return undefined;
    }

    const vertices = boundingBox.vertices;
    const x = vertices[0]?.x || 0;
    const y = vertices[0]?.y || 0;
    const width = (vertices[1]?.x || 0) - x;
    const height = (vertices[2]?.y || 0) - y;

    return { x, y, width, height };
  }

  /**
   * Calculate average confidence
   */
  private calculateConfidence(fullTextAnnotation: protos.google.cloud.vision.v1.ITextAnnotation): number {
    if (!fullTextAnnotation.pages) return 0;

    let totalConfidence = 0;
    let count = 0;

    for (const page of fullTextAnnotation.pages) {
      if (!page.blocks) continue;

      for (const block of page.blocks) {
        if (block.confidence) {
          totalConfidence += block.confidence;
          count++;
        }
      }
    }

    return count > 0 ? totalConfidence / count : 0;
  }

  /**
   * Health check
   */
  public healthCheck(): { status: string; ready: boolean } {
    return {
      status: this.visionClient ? 'operational' : 'not_configured',
      ready: this.visionClient !== null,
    };
  }
}
