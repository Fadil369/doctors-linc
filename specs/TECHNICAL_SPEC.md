# Technical Specification - Doctors-Linc OCR Pipeline

**Version**: 1.0.0  
**Date**: January 15, 2024  
**Status**: Design Phase

---

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCTORS-LINC SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ Web UI   │   │   CLI    │   │ REST API │   │  Mobile  │    │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘    │
└───────┼──────────────┼──────────────┼──────────────┼───────────┘
        └──────────────┴──────────────┴──────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                  API Gateway (Express.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Authentication│  │ Rate Limiter │  │   Logging    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROCESSING LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Pipeline Orchestrator (MASTERLINC)         │      │
│  └────────┬─────────────┬─────────────┬─────────────┬───┘      │
│           ▼             ▼             ▼             ▼           │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐   │
│  │  OCRLINC   │  │HEALTHCARELNC│ │COMPLIANCE│  │  TTLINC  │   │
│  │(OCR Agent) │  │(Medical AI) │  │  LINC    │  │(Translate│   │
│  └──────┬─────┘  └──────┬─────┘  └────┬─────┘  └────┬─────┘   │
└─────────┼────────────────┼─────────────┼─────────────┼─────────┘
          │                │             │             │
          ▼                ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  Google  │   │  OpenAI  │   │ PptxGen  │   │  Redis   │    │
│  │  Vision  │   │   API    │   │    JS    │   │  Queue   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │                │             │             │
          ▼                ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │PostgreSQL│   │   S3     │   │  Redis   │   │  Audit   │    │
│  │   DB     │   │ Storage  │   │  Cache   │   │   Logs   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components

### 2.1 Pipeline Orchestrator (MASTERLINC)

**Technology**: Node.js, Bull Queue

**Responsibilities**:
- Coordinate agent execution
- Manage pipeline state
- Handle retries and failures
- Aggregate results

**Implementation**:

```javascript
// src/orchestrator/pipeline.js
class PipelineOrchestrator {
  constructor() {
    this.queue = new Bull('pipeline', { redis: redisConfig });
    this.agents = {
      ocr: new OCRAgent(),
      healthcare: new HealthcareAgent(),
      compliance: new ComplianceAgent(),
      translation: new TranslationAgent()
    };
  }

  async execute(job) {
    const { imagePath, options } = job.data;
    
    try {
      // Stage 1: OCR
      const ocrResult = await this.agents.ocr.extractText({ imagePath });
      await this.updateProgress(job, 33);
      
      // Stage 2: Structure
      const structured = await this.agents.healthcare.structure({
        text: ocrResult.text,
        documentType: options.documentType
      });
      await this.updateProgress(job, 66);
      
      // Stage 3: Compliance
      await this.agents.compliance.logAccess({
        resourceType: 'Document',
        action: 'create'
      });
      
      // Stage 4: Generate outputs
      const outputs = await this.generateOutputs(structured);
      await this.updateProgress(job, 100);
      
      return { status: 'success', data: outputs };
    } catch (error) {
      await this.handleError(job, error);
      throw error;
    }
  }
}
```

---

### 2.2 OCR Agent (OCRLINC)

**Technology**: Google Cloud Vision API

**Implementation**:

```javascript
// src/agents/ocr-agent.js
const vision = require('@google-cloud/vision');

class OCRAgent {
  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  async extractText({ imagePath, language = ['en'], enhanceQuality = true }) {
    // Preprocess if needed
    if (enhanceQuality) {
      imagePath = await this.enhanceImage(imagePath);
    }

    // Perform OCR
    const [result] = await this.client.documentTextDetection(imagePath);
    const fullText = result.fullTextAnnotation;

    return {
      text: fullText.text,
      confidence: this.calculateConfidence(fullText),
      blocks: this.extractBlocks(fullText),
      language: language
    };
  }

  async enhanceImage(imagePath) {
    const sharp = require('sharp');
    const enhanced = `${imagePath}_enhanced.jpg`;
    
    await sharp(imagePath)
      .normalize()
      .sharpen()
      .toFile(enhanced);
    
    return enhanced;
  }

  calculateConfidence(fullText) {
    const pages = fullText.pages || [];
    const confidences = pages.flatMap(page => 
      page.blocks.flatMap(block => 
        block.paragraphs.flatMap(para => 
          para.words.map(word => word.confidence)
        )
      )
    );
    
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
  }
}
```

---

### 2.3 Healthcare Agent (HEALTHCARELINC)

**Technology**: LangChain, OpenAI GPT-4

**Implementation**:

```javascript
// src/agents/healthcare-agent.js
const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate, LLMChain } = require('langchain');

class HealthcareAgent {
  constructor() {
    this.llm = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3
    });
  }

  async structure({ text, documentType }) {
    const prompt = this.getPromptTemplate(documentType);
    const chain = new LLMChain({ llm: this.llm, prompt });
    
    const result = await chain.call({ raw_text: text });
    
    return {
      markdown: result.text,
      documentType,
      sections: this.extractSections(result.text)
    };
  }

  getPromptTemplate(documentType) {
    const templates = {
      prescription: `
        Convert the following prescription text into structured Markdown:
        
        Format:
        ## Patient Information
        - Name: [extract name]
        - DOB: [extract date]
        
        ## Medications
        1. [Drug name] [dose] [route] [frequency]
        
        Raw text:
        {raw_text}
      `,
      lab_results: `
        Convert the following lab results into structured Markdown:
        
        Format:
        ## Lab Results
        | Test | Value | Unit | Reference Range | Flag |
        |------|-------|------|-----------------|------|
        | [test] | [value] | [unit] | [range] | [flag] |
        
        Raw text:
        {raw_text}
      `
    };
    
    return PromptTemplate.fromTemplate(
      templates[documentType] || templates.prescription
    );
  }
}
```

---

### 2.4 Presentation Generator

**Technology**: PptxGenJS

**Implementation**:

```javascript
// src/generators/presentation.js
const PptxGenJS = require('pptxgenjs');
const fs = require('fs-extra');

class PresentationGenerator {
  async generate({ markdownFiles, template, language, outputPath }) {
    const pres = new PptxGenJS();
    
    // Apply template
    if (template) {
      this.applyTemplate(pres, template);
    }
    
    // Set language-specific settings
    const isRTL = language === 'ar';
    
    // Add slides from markdown files
    for (const mdFile of markdownFiles) {
      const markdown = await fs.readFile(mdFile, 'utf-8');
      await this.addSlide(pres, markdown, { isRTL });
    }
    
    // Save presentation
    await pres.writeFile({ fileName: outputPath });
    
    return {
      path: outputPath,
      slideCount: pres.slides.length
    };
  }

  async addSlide(pres, markdown, options = {}) {
    const slide = pres.addSlide();
    const { isRTL } = options;
    
    // Extract title
    const titleMatch = markdown.match(/^##?\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Medical Document';
    
    // Add title
    slide.addText(title, {
      x: isRTL ? '10%' : 1,
      y: 0.5,
      w: '80%',
      fontSize: 24,
      bold: true,
      align: isRTL ? 'right' : 'left',
      rtlMode: isRTL
    });
    
    // Add content
    slide.addText(markdown, {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: '70%',
      fontSize: 12,
      fontFace: 'Courier New',
      align: isRTL ? 'right' : 'left',
      rtlMode: isRTL
    });
  }
}
```

---

## 3. Database Schema

### 3.1 PostgreSQL Tables

```sql
-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  document_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- OCR Results table
CREATE TABLE ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  raw_text TEXT,
  confidence DECIMAL(3,2),
  language VARCHAR(10),
  blocks JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- Structured Documents table
CREATE TABLE structured_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  markdown TEXT,
  sections JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- FHIR Resources table
CREATE TABLE fhir_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource JSONB NOT NULL,
  valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- Presentations table
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_ids UUID[],
  file_path TEXT NOT NULL,
  slide_count INTEGER,
  template VARCHAR(50),
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Logs table (HIPAA compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  action VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  justification TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_ocr_results_document_id ON ocr_results(document_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## 4. Security Implementation

### 4.1 Encryption

```javascript
// src/security/encryption.js
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt({ encrypted, iv, authTag }) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

### 4.2 JWT Authentication

```javascript
// src/auth/jwt.js
const jwt = require('jsonwebtoken');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  middleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}
```

---

## 5. Performance Optimization

### 5.1 Caching Strategy

```javascript
// src/cache/redis-cache.js
const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });
  }

  async get(key) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async cacheOCRResult(documentId, result) {
    const key = `ocr:${documentId}`;
    await this.set(key, result, 86400); // 24 hours
  }

  async getCachedOCR(documentId) {
    const key = `ocr:${documentId}`;
    return await this.get(key);
  }
}
```

---

## 6. Monitoring & Logging

### 6.1 Application Logging

```javascript
// src/logging/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Never log PHI
logger.sanitize = (data) => {
  const sanitized = { ...data };
  delete sanitized.national_id;
  delete sanitized.ssn;
  delete sanitized.patient_name;
  return sanitized;
};

module.exports = logger;
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```javascript
// tests/unit/ocr-agent.test.js
const { OCRAgent } = require('../../src/agents/ocr-agent');

describe('OCRAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new OCRAgent();
  });

  test('should extract text from image', async () => {
    const result = await agent.extractText({
      imagePath: './tests/fixtures/prescription.jpg'
    });

    expect(result.text).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test('should calculate confidence correctly', () => {
    const mockFullText = {
      pages: [{
        blocks: [{
          paragraphs: [{
            words: [
              { confidence: 0.95 },
              { confidence: 0.90 }
            ]
          }]
        }]
      }]
    };

    const confidence = agent.calculateConfidence(mockFullText);
    expect(confidence).toBe(0.925);
  });
});
```

---

## 8. Deployment

### 8.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Create directories
RUN mkdir -p /app/uploads /app/output

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/doctorslinc
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=doctorslinc
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

**Last Updated**: January 15, 2024  
**Version**: 1.0.0  
**Maintainer**: Doctors-Linc Engineering Team
