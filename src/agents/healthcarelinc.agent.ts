/**
 * HEALTHCARELINC - Medical Intelligence Agent
 * 
 * Processes and structures medical content with clinical context awareness.
 */

import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface MedicalProcessingInput {
  rawText: string;
  context?: 'prescription' | 'lab_results' | 'clinical_notes' | 'discharge_summary';
  outputFormat?: 'markdown' | 'fhir' | 'json';
  validate?: boolean;
}

export interface MedicalProcessingResult {
  structured Text: string;
  documentType: string;
  entities: MedicalEntity[];
  confidence: number;
  warnings?: string[];
}

export interface MedicalEntity {
  type: 'medication' | 'diagnosis' | 'procedure' | 'lab_test' | 'vital_sign';
  name: string;
  value?: string;
  code?: string;
  codeSystem?: string;
}

export class HealthCareLincAgent {
  private static instance: HealthCareLincAgent;
  private llm: ChatOpenAI | null = null;
  private initialized = false;

  private constructor() {
    this.initializeLLM();
  }

  public static getInstance(): HealthCareLincAgent {
    if (!HealthCareLincAgent.instance) {
      HealthCareLincAgent.instance = new HealthCareLincAgent();
    }
    return HealthCareLincAgent.instance;
  }

  /**
   * Initialize OpenAI LLM
   */
  private initializeLLM(): void {
    try {
      if (!config.openai.apiKey) {
        logger.warn('⚠️ HEALTHCARELINC: OpenAI API key not configured');
        return;
      }

      this.llm = new ChatOpenAI({
        openAIApiKey: config.openai.apiKey,
        modelName: config.openai.model,
        temperature: config.openai.temperature,
        maxTokens: config.openai.maxTokens,
      });

      this.initialized = true;
      logger.info('✅ HEALTHCARELINC: OpenAI LLM initialized');
    } catch (error) {
      logger.error('❌ HEALTHCARELINC: Failed to initialize LLM:', error);
    }
  }

  /**
   * Process and structure medical text
   */
  public async process(input: MedicalProcessingInput): Promise<MedicalProcessingResult> {
    logger.info(`🏥 HEALTHCARELINC: Processing medical text (${input.context || 'unknown context'})`);

    if (!this.initialized || !this.llm) {
      throw new Error('HEALTHCARELINC not properly initialized');
    }

    try {
      // Create prompt template for medical text structuring
      const prompt = this.createPromptTemplate(input.context);

      // Process text with LLM
      const response = await prompt.format({ rawText: input.rawText });
      const structuredText = await this.llm.invoke(response);

      // Extract medical entities (simplified for now)
      const entities = this.extractEntities(structuredText.content.toString());

      // Detect document type
      const documentType = this.detectDocumentType(input.rawText);

      const result: MedicalProcessingResult = {
        structuredText: structuredText.content.toString(),
        documentType,
        entities,
        confidence: 0.85, // Placeholder - should be calculated based on LLM response
        warnings: [],
      };

      logger.info(`✅ HEALTHCARELINC: Processing complete (type: ${documentType})`);

      return result;
    } catch (error) {
      logger.error('❌ HEALTHCARELINC: Processing failed:', error);
      throw error;
    }
  }

  /**
   * Create prompt template based on context
   */
  private createPromptTemplate(context?: string): PromptTemplate {
    let template = '';

    switch (context) {
      case 'prescription':
        template = `You are a medical AI assistant specializing in prescription analysis.
Convert the following raw OCR text from a medical prescription into structured Markdown format.

Extract and organize:
- Patient Information (name, age, ID)
- Medications (name, dose, frequency, route, duration)
- Doctor Information
- Date prescribed

Raw OCR Text:
{rawText}

Structured Output (Markdown):`;
        break;

      case 'lab_results':
        template = `You are a medical AI assistant specializing in laboratory results analysis.
Convert the following raw OCR text from lab results into structured Markdown format.

Extract and organize:
- Patient Information
- Test Names and Values
- Reference Ranges
- Abnormal Flags (High/Low/Critical)
- Test Date

Raw OCR Text:
{rawText}

Structured Output (Markdown):`;
        break;

      case 'clinical_notes':
        template = `You are a medical AI assistant specializing in clinical documentation.
Convert the following raw OCR text from clinical notes into structured Markdown format.

Extract and organize using SOAP format:
- Subjective (patient complaints, symptoms)
- Objective (physical exam findings, vitals)
- Assessment (diagnosis, differential)
- Plan (treatment, follow-up)

Raw OCR Text:
{rawText}

Structured Output (Markdown):`;
        break;

      default:
        template = `You are a medical AI assistant.
Convert the following raw OCR text from a medical document into well-structured Markdown format.

Use appropriate headings (##), lists, and tables to organize the information clearly.
Expand common medical abbreviations.
Preserve all medical terminology and codes.

Raw OCR Text:
{rawText}

Structured Output (Markdown):`;
    }

    return PromptTemplate.fromTemplate(template);
  }

  /**
   * Extract medical entities from text (simplified implementation)
   */
  private extractEntities(text: string): MedicalEntity[] {
    const entities: MedicalEntity[] = [];

    // Simple regex-based extraction (should be replaced with NER model)
    
    // Detect medications (simplified pattern)
    const medRegex = /\b([A-Z][a-z]+(?:in|ol|ide|ine))\s+(\d+\s*(?:mg|mcg|g|mL))/gi;
    let match;
    while ((match = medRegex.exec(text)) !== null) {
      entities.push({
        type: 'medication',
        name: match[1],
        value: match[2],
      });
    }

    return entities;
  }

  /**
   * Detect document type from text
   */
  private detectDocumentType(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('prescription') || lowerText.includes('rx:')) {
      return 'prescription';
    }
    if (lowerText.includes('lab results') || lowerText.includes('laboratory')) {
      return 'lab_results';
    }
    if (lowerText.includes('discharge') && lowerText.includes('summary')) {
      return 'discharge_summary';
    }
    if (lowerText.includes('soap') || lowerText.includes('subjective')) {
      return 'clinical_notes';
    }

    return 'unknown';
  }

  /**
   * Expand medical abbreviations
   */
  public expandAbbreviations(text: string): string {
    const abbreviations: Record<string, string> = {
      'BID': 'Twice daily',
      'TID': 'Three times daily',
      'QID': 'Four times daily',
      'PO': 'By mouth / Oral',
      'IV': 'Intravenous',
      'IM': 'Intramuscular',
      'PRN': 'As needed',
      'STAT': 'Immediately',
      'NPO': 'Nothing by mouth',
      'SOB': 'Shortness of breath',
      'HTN': 'Hypertension',
      'DM': 'Diabetes Mellitus',
      'CAD': 'Coronary Artery Disease',
      'CHF': 'Congestive Heart Failure',
      'CBC': 'Complete Blood Count',
      'CMP': 'Comprehensive Metabolic Panel',
    };

    let expandedText = text;
    for (const [abbr, expansion] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');
      expandedText = expandedText.replace(regex, `${abbr} (${expansion})`);
    }

    return expandedText;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{ status: string; ready: boolean }> {
    return {
      status: this.initialized ? 'operational' : 'not_configured',
      ready: this.initialized,
    };
  }
}
