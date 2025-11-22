#!/usr/bin/env node
/**
 * Doctors-Linc CLI
 * Command-line interface for medical document processing
 */

import 'reflect-metadata';
import dotenv from 'dotenv';
import { program } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from './utils/logger';
import { MasterLincAgent } from './agents/masterlinc.agent';
import { OCRLincAgent } from './agents/ocrlinc.agent';
import { HealthCareLincAgent } from './agents/healthcarelinc.agent';
import { config } from './config';

// Load environment variables
dotenv.config();

// CLI Version
const CLI_VERSION = '0.1.0';

/**
 * Main CLI application
 */
program
  .name('doctors-linc')
  .description('AI-powered OCR pipeline for healthcare document processing')
  .version(CLI_VERSION);

/**
 * OCR Command - Extract text from medical images
 */
program
  .command('ocr')
  .description('Extract text from medical image using OCR')
  .argument('<image>', 'Path to medical image file')
  .option('-l, --language <langs>', 'Comma-separated language codes (e.g., en,ar)', 'en')
  .option('-o, --output <path>', 'Output file path for extracted text')
  .option('--enhance', 'Enhance image quality before OCR', false)
  .action(async (imagePath: string, options) => {
    try {
      logger.info(`🔍 Starting OCR on: ${imagePath}`);

      // Validate image exists
      if (!await fs.pathExists(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Initialize OCRLINC agent
      const ocrAgent = OCRLincAgent.getInstance();

      // Perform OCR
      const result = await ocrAgent.extractText({
        imagePath,
        language: options.language.split(','),
        enhanceQuality: options.enhance,
      });

      // Output results
      console.log('\n📄 OCR Results:');
      console.log('─'.repeat(80));
      console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
      console.log(`Languages: ${result.detectedLanguages.join(', ')}`);
      console.log(`Processing Time: ${result.metadata.processingTime}ms`);
      console.log(`Text Blocks: ${result.blocks.length}`);
      console.log('─'.repeat(80));
      console.log('\nExtracted Text:');
      console.log(result.text);
      console.log('─'.repeat(80));

      // Save to file if output path specified
      if (options.output) {
        await fs.writeFile(options.output, result.text, 'utf-8');
        logger.info(`✅ Text saved to: ${options.output}`);
      }

      logger.info('✅ OCR completed successfully');
    } catch (error) {
      logger.error('❌ OCR failed:', error);
      process.exit(1);
    }
  });

/**
 * Process Command - Run full pipeline on medical image
 */
program
  .command('process')
  .description('Process medical image through complete pipeline')
  .argument('<image>', 'Path to medical image file')
  .option('-c, --context <type>', 'Document context (prescription|lab_results|clinical_notes)', 'unknown')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('--no-ocr', 'Skip OCR (use pre-extracted text file)')
  .option('--no-structure', 'Skip AI structuring')
  .option('--translate <lang>', 'Translate to language (e.g., ar)')
  .action(async (imagePath: string, options) => {
    try {
      logger.info(`🏥 Processing medical document: ${imagePath}`);

      // Ensure output directory exists
      await fs.ensureDir(options.output);

      const filename = path.basename(imagePath, path.extname(imagePath));
      let rawText = '';

      // Step 1: OCR
      if (options.ocr) {
        logger.info('Step 1/3: OCR text extraction');
        const ocrAgent = OCRLincAgent.getInstance();
        const ocrResult = await ocrAgent.extractText({ imagePath });
        rawText = ocrResult.text;

        // Save raw OCR text
        const ocrOutputPath = path.join(options.output, `${filename}-raw.txt`);
        await fs.writeFile(ocrOutputPath, rawText, 'utf-8');
        logger.info(`✅ Raw text saved: ${ocrOutputPath}`);
      } else {
        // Read from pre-extracted text file
        const textPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.txt');
        rawText = await fs.readFile(textPath, 'utf-8');
        logger.info('Loaded pre-extracted text');
      }

      // Step 2: AI Structuring
      let structuredText = rawText;
      if (options.structure) {
        logger.info('Step 2/3: AI-powered structuring');
        const healthcareAgent = HealthCareLincAgent.getInstance();
        const result = await healthcareAgent.process({
          rawText,
          context: options.context,
          outputFormat: 'markdown',
        });
        structuredText = result.structuredText;

        // Save structured markdown
        const mdOutputPath = path.join(options.output, `${filename}.md`);
        await fs.writeFile(mdOutputPath, structuredText, 'utf-8');
        logger.info(`✅ Structured markdown saved: ${mdOutputPath}`);
      }

      // Step 3: Translation (if requested)
      if (options.translate) {
        logger.info(`Step 3/3: Translation to ${options.translate}`);
        // Translation agent not yet implemented
        logger.warn('⚠️ Translation feature coming soon');
      }

      console.log('\n✅ Processing Complete!');
      console.log('─'.repeat(80));
      console.log(`Output directory: ${options.output}`);
      console.log('─'.repeat(80));

      logger.info('✅ Pipeline completed successfully');
    } catch (error) {
      logger.error('❌ Processing failed:', error);
      process.exit(1);
    }
  });

/**
 * Health Command - Check system health
 */
program
  .command('health')
  .description('Check health status of all agents and services')
  .action(async () => {
    try {
      console.log('🏥 Doctors-Linc Health Check');
      console.log('═'.repeat(80));

      // Check MASTERLINC
      const masterAgent = MasterLincAgent.getInstance();
      const masterHealth = await masterAgent.healthCheck();
      console.log(`\nMASTERLINC: ${masterHealth.status === 'healthy' ? '✅' : '❌'} ${masterHealth.status}`);
      console.log('  Agents:');
      for (const [agent, status] of Object.entries(masterHealth.agents)) {
        const icon = status === 'operational' ? '✅' : '⚠️';
        console.log(`    ${icon} ${agent}: ${status}`);
      }

      // Check OCRLINC
      const ocrAgent = OCRLincAgent.getInstance();
      const ocrHealth = await ocrAgent.healthCheck();
      console.log(`\nOCRLINC: ${ocrHealth.ready ? '✅' : '⚠️'} ${ocrHealth.status}`);

      // Check HEALTHCARELINC
      const healthcareAgent = HealthCareLincAgent.getInstance();
      const healthcareHealth = await healthcareAgent.healthCheck();
      console.log(`HEALTHCARELINC: ${healthcareHealth.ready ? '✅' : '⚠️'} ${healthcareHealth.status}`);

      // Check configuration
      console.log('\nConfiguration:');
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  OCR Confidence Threshold: ${(config.ocr.confidenceThreshold * 100).toFixed(0)}%`);
      console.log(`  Languages: ${config.ocr.languages.join(', ')}`);
      console.log(`  OpenAI Model: ${config.openai.model}`);

      console.log('═'.repeat(80));
    } catch (error) {
      logger.error('❌ Health check failed:', error);
      process.exit(1);
    }
  });

/**
 * Config Command - Show current configuration
 */
program
  .command('config')
  .description('Display current configuration')
  .action(() => {
    console.log('🔧 Current Configuration:');
    console.log('═'.repeat(80));
    console.log(JSON.stringify(config, null, 2));
    console.log('═'.repeat(80));
  });

// Parse command line arguments
program.parse();
