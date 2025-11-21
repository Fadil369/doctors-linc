# Doctors-Linc 🏥📄

> AI-powered OCR pipeline for healthcare document processing with automated PowerPoint generation

## 📋 Project Overview

**Doctors-Linc** is an early-stage OCR pipeline project designed to streamline medical document processing for healthcare professionals. The system extracts text from medical images, structures it into clean Markdown, and generates professional PowerPoint presentations automatically.

### Current Status

⚠️ **Conceptual Stage**: This project contains architectural sketches and implementation plans. No working code has been deployed yet.

### Core Capabilities (Planned)

1. **OCR Processing**: Extract text from medical images (PNG/JPG) using Google Cloud Vision API
2. **AI Structuring**: Convert raw OCR output into structured Markdown using LangChain + OpenAI
3. **Presentation Generation**: Automatically create PowerPoint presentations with PptxGenJS
4. **Template Support**: Integration with PowerPoint slide masters and Keynote automation

---

## 🏗️ Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCTORS-LINC PIPELINE                    │
└─────────────────────────────────────────────────────────────┘

INPUT STAGE
┌──────────────────┐
│  Medical Images  │  PNG, JPG, JPEG
│  ./images/       │  (Doctor's notes, charts, prescriptions)
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 1: OCR TEXT EXTRACTION                   │
├─────────────────────────────────────────────────────────────┤
│  Google Cloud Vision API                                    │
│  • documentTextDetection()                                  │
│  • Full-document scanning                                   │
│  • Handwriting recognition                                  │
│  • Multi-language support                                   │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Raw OCR Text
         ▼
┌─────────────────────────────────────────────────────────────┐
│        STAGE 2: AI-POWERED TEXT STRUCTURING                 │
├─────────────────────────────────────────────────────────────┤
│  LangChain + OpenAI                                         │
│  • PromptTemplate for medical context                       │
│  • LLMChain processing                                      │
│  • Convert to structured Markdown:                          │
│    - Headings (## Patient Info, ## Diagnosis)               │
│    - Lists (medications, symptoms)                          │
│    - Code blocks (medical codes, formulas)                  │
│    - Tables (lab results)                                   │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Structured Markdown
         ▼
┌─────────────────────────────────────────────────────────────┐
│            STAGE 3: OUTPUT GENERATION                       │
├─────────────────────────────────────────────────────────────┤
│  PptxGenJS                                                  │
│  • Individual .md files per image                           │
│  • Bundled presentation.pptx                                │
│  • Courier New font for readability                         │
│  • Custom slide masters support                            │
│  • Keynote AppleScript integration (optional)               │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
OUTPUT STAGE
┌──────────────────┐
│   ./output/      │
│  ├── image1.md   │  Individual Markdown files
│  ├── image2.md   │
│  └── pres.pptx   │  Consolidated presentation
└──────────────────┘
```

### Component Responsibilities

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **OCR Engine** | Google Cloud Vision | Extract raw text from medical images |
| **AI Processor** | LangChain + OpenAI | Structure and contextualize medical text |
| **Document Generator** | Node.js fs | Create individual Markdown files |
| **Presentation Builder** | PptxGenJS | Generate PowerPoint presentations |
| **Template Engine** | Slide Masters/AppleScript | Apply custom branding and layouts |

---

## 🚀 Development Setup

### Prerequisites

Before starting, ensure you have:

- **Node.js** (v16+ recommended)
- **npm** or **yarn** package manager
- **Google Cloud Platform** account with Vision API enabled
- **OpenAI** API account and key

### Step 1: Google Cloud Vision Setup

1. **Create a GCP Project**:
   ```bash
   gcloud projects create doctors-linc-ocr
   gcloud config set project doctors-linc-ocr
   ```

2. **Enable Vision API**:
   ```bash
   gcloud services enable vision.googleapis.com
   ```

3. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create doctors-linc-sa \
     --display-name="Doctors-Linc OCR Service Account"
   ```

4. **Generate Credentials**:
   ```bash
   gcloud iam service-accounts keys create ./credentials/gcp-key.json \
     --iam-account=doctors-linc-sa@doctors-linc-ocr.iam.gserviceaccount.com
   ```

5. **Grant Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding doctors-linc-ocr \
     --member="serviceAccount:doctors-linc-sa@doctors-linc-ocr.iam.gserviceaccount.com" \
     --role="roles/cloudvision.user"
   ```

### Step 2: OpenAI Setup

1. **Get API Key**: Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Create new secret key** and save it securely

### Step 3: Environment Configuration

Create a `.env` file in the project root:

```bash
# Google Cloud Vision
GOOGLE_APPLICATION_CREDENTIALS=./credentials/gcp-key.json

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Optional: Configure models
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.3

# Output paths
INPUT_DIR=./images
OUTPUT_DIR=./output
```

### Step 4: Project Structure

Create the required directories:

```bash
mkdir -p doctors-linc/{images,output,credentials,templates}
cd doctors-linc
```

Expected structure:
```
doctors-linc/
├── images/              # Input medical images
├── output/              # Generated .md files and .pptx
├── credentials/         # GCP service account keys
├── templates/           # PowerPoint/Keynote templates
├── src/                 # Source code (when implemented)
├── .env                 # Environment variables
├── package.json         # Node.js dependencies
└── README.md            # This file
```

---

## 📦 Dependencies

### Installation

When implementation begins, install dependencies with:

```bash
npm install
```

### Required Packages

```json
{
  "name": "doctors-linc",
  "version": "0.1.0",
  "description": "AI-powered OCR pipeline for healthcare document processing",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/vision": "^4.0.0",
    "langchain": "^0.1.0",
    "openai": "^4.0.0",
    "pptxgenjs": "^3.12.0",
    "dotenv": "^16.0.0",
    "fs-extra": "^11.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "nodemon": "^3.0.0"
  }
}
```

### Package Descriptions

| Package | Version | Purpose |
|---------|---------|---------|
| `@google-cloud/vision` | ^4.0.0 | Google Cloud Vision API client for OCR |
| `langchain` | ^0.1.0 | LLM orchestration framework |
| `openai` | ^4.0.0 | OpenAI API client for GPT models |
| `pptxgenjs` | ^3.12.0 | PowerPoint generation library |
| `dotenv` | ^16.0.0 | Environment variable management |
| `fs-extra` | ^11.0.0 | Enhanced file system operations |

---

## 🔨 Build Commands

> **Note**: These commands are placeholders for when implementation exists.

### Installation
```bash
# Install dependencies
npm install

# Verify environment setup
npm run check-env
```

### Development
```bash
# Run the pipeline (development mode)
npm run dev

# Process specific image
npm run process -- --image=./images/prescription.jpg

# Watch mode for testing
npm run watch
```

### Production
```bash
# Run the pipeline (production mode)
npm start

# Process entire images directory
npm run process-all

# Generate presentation only (skip OCR)
npm run generate-pptx
```

### Testing
```bash
# Run all tests
npm test

# Run OCR tests only
npm run test:ocr

# Run with coverage
npm run test:coverage
```

### Utilities
```bash
# Clean output directory
npm run clean

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🔑 Key Implementation Details

### 1. OCR Processing (Google Cloud Vision)

```javascript
// Uses documentTextDetection() for full-document scanning
const [result] = await ocrClient.documentTextDetection(imagePath);
const rawText = result.fullTextAnnotation.text;
```

**Features**:
- Full-document text detection
- Handwriting recognition
- Multi-language support (English, Arabic, etc.)
- Layout and structure preservation
- Confidence scoring for extracted text

### 2. AI Structuring (LangChain + OpenAI)

```javascript
const prompt = PromptTemplate.fromTemplate(`
  Convert the following raw OCR text into structured Markdown 
  with headings, lists, diagrams as code blocks:
  
  \`\`\`
  {{raw}}
  \`\`\`
`);

const chain = new LLMChain({ llm, prompt });
const structuredMarkdown = await chain.call({ raw: rawText });
```

**Output Format**:
- **Headings**: `## Patient Information`, `## Diagnosis`
- **Lists**: Medications, symptoms, procedures
- **Code Blocks**: Medical codes (ICD-10, CPT), chemical formulas
- **Tables**: Lab results, vitals tracking

### 3. Presentation Generation (PptxGenJS)

```javascript
const pres = new PptxGenJS();
const slide = pres.addSlide();
slide.addText('Medical Documentation', { 
  x: 1, y: 0.5, fontSize: 24, bold: true 
});
slide.addText(markdownContent, { 
  x: 0.5, y: 1.5, w: '90%', h: '70%', 
  fontFace: 'Courier New', fontSize: 12 
});
await pres.writeFile({ fileName: './output/presentation.pptx' });
```

**Customization Options**:
- Font: Courier New (monospace for clarity)
- Slide masters: Custom templates with `{{content}}` placeholders
- Branding: Hospital logos, color schemes
- Layouts: Title slides, content slides, summary slides

### 4. Template Support

#### PowerPoint Template
1. Create slide master with placeholder text box titled `{{content}}`
2. PptxGenJS injects Markdown into placeholder
3. Apply custom branding (hospital logo, color scheme)

#### Keynote Template (macOS)
1. Use `.key` file with text placeholder named `ContentPlaceholder`
2. AppleScript automation opens template and replaces content
3. Export as PDF or PowerPoint format

```applescript
tell application "Keynote"
  open "/path/to/template.key"
  tell front document
    tell slide 1
      set object text of text item "ContentPlaceholder" to markdownContent
    end tell
  end tell
end tell
```

---

## 🏥 Healthcare Compliance & HIPAA Considerations

### ⚠️ IMPORTANT: Protected Health Information (PHI)

If you plan to process **real patient data**, this system **MUST** comply with HIPAA regulations:

### Required Security Measures

1. **Data Encryption**
   - ✅ Encrypt all PHI at rest (AES-256)
   - ✅ Encrypt all PHI in transit (TLS 1.2+)
   - ✅ Encrypt Google Cloud Storage buckets
   - ✅ Use encrypted environment variables

2. **Access Controls**
   - ✅ Implement role-based access control (RBAC)
   - ✅ Multi-factor authentication (MFA) for API access
   - ✅ Least privilege principle for service accounts
   - ✅ Regular access audits and reviews

3. **Audit Logging**
   - ✅ Log every access to patient data
   - ✅ Track user ID, timestamp, and action
   - ✅ Store logs for minimum 6 years
   - ✅ Implement tamper-proof logging

4. **Data Retention & Disposal**
   - ✅ Automatic deletion of temporary files
   - ✅ Secure deletion of OCR cache
   - ✅ Documented retention policies
   - ✅ Secure shredding of decommissioned storage

5. **Business Associate Agreements (BAA)**
   - ✅ Sign BAA with Google Cloud Platform
   - ✅ Sign BAA with OpenAI (if processing PHI)
   - ✅ Verify all third-party services are HIPAA-compliant

### HIPAA Compliance Checklist

```markdown
- [ ] Encryption at rest enabled (Google Cloud Storage)
- [ ] Encryption in transit enabled (TLS 1.2+)
- [ ] Access controls implemented (IAM, RBAC)
- [ ] Audit logging configured (Cloud Logging)
- [ ] BAA signed with Google Cloud
- [ ] BAA signed with OpenAI
- [ ] Data retention policy documented
- [ ] Incident response plan created
- [ ] Security risk assessment completed
- [ ] HIPAA training completed for all users
- [ ] Regular security audits scheduled
```

### Recommended Architecture for HIPAA Compliance

```
┌────────────────────────────────────────────┐
│         HIPAA-Compliant Architecture       │
└────────────────────────────────────────────┘

Healthcare Facility
       │
       │ TLS 1.2+
       ▼
┌──────────────────┐
│   API Gateway    │  ← Authentication (JWT, MFA)
│   (HTTPS only)   │  ← Rate limiting
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Application     │  ← Input validation
│  Server          │  ← PHI de-identification (optional)
│  (Node.js)       │  ← Audit logging
└────────┬─────────┘
         │
         ├─────────────────────┬──────────────────┐
         │                     │                  │
         ▼                     ▼                  ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────┐
│ Google Cloud    │  │ OpenAI API     │  │ Encrypted    │
│ Vision API      │  │ (with BAA)     │  │ Database     │
│ (with BAA)      │  └────────────────┘  │ (PostgreSQL) │
└─────────────────┘                      └──────────────┘
         │
         ▼
┌─────────────────┐
│ Audit Log Store │  ← Immutable logs
│ (Cloud Logging) │  ← 6-year retention
└─────────────────┘
```

### PHI De-identification (Optional)

Consider de-identifying PHI before sending to third-party APIs:

```javascript
// Remove direct identifiers before OCR processing
function deidentifyText(text) {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')           // SSN
    .replace(/\b\d{10}\b/g, '[PHONE]')                     // Phone
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')    // Names
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]');   // Dates
}
```

### Additional Resources

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Google Cloud HIPAA Compliance](https://cloud.google.com/security/compliance/hipaa)
- [OpenAI HIPAA BAA](https://openai.com/enterprise-privacy)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 🛠️ Development Roadmap

### Phase 1: Core Pipeline (MVP)
- [ ] Set up Node.js project structure
- [ ] Integrate Google Cloud Vision OCR
- [ ] Implement LangChain + OpenAI structuring
- [ ] Generate basic Markdown output
- [ ] Create simple PowerPoint presentations

### Phase 2: Enhanced Features
- [ ] Support multiple image formats (TIFF, BMP, HEIC)
- [ ] Implement batch processing
- [ ] Add custom slide templates
- [ ] Integrate Keynote automation (macOS)
- [ ] Build CLI interface

### Phase 3: HIPAA Compliance
- [ ] Implement encryption at rest/transit
- [ ] Add audit logging
- [ ] Set up access controls
- [ ] Sign BAAs with vendors
- [ ] Complete security risk assessment

### Phase 4: Production Ready
- [ ] Build web interface for uploads
- [ ] Deploy to cloud (AWS/GCP)
- [ ] Implement monitoring and alerts
- [ ] Create user documentation
- [ ] Perform load testing

---

## 📝 Usage Example (Planned)

```javascript
const DoctorsLinc = require('doctors-linc');

// Initialize pipeline
const pipeline = new DoctorsLinc({
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  openaiKey: process.env.OPENAI_API_KEY
});

// Process images
await pipeline.processDirectory('./images', {
  outputFormat: ['markdown', 'pptx'],
  template: './templates/hospital-branded.pptx',
  deidentify: true  // Remove PHI before AI processing
});

// Output:
// ✓ Processed 5 images
// ✓ Generated 5 .md files
// ✓ Created presentation.pptx
```

---

## 🤝 Contributing

This project is in early conceptual stage. Contributions welcome once implementation begins!

### Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is currently unlicensed. License will be determined when implementation begins.

---

## 📧 Contact

For questions or collaboration:
- **Project**: Doctors-Linc
- **Purpose**: Healthcare document processing automation
- **Status**: Conceptual/Planning Phase

---

## ⚡ Quick Start Checklist

```markdown
- [ ] Install Node.js (v16+)
- [ ] Create Google Cloud Platform account
- [ ] Enable Google Cloud Vision API
- [ ] Generate service account credentials
- [ ] Sign up for OpenAI API
- [ ] Clone/create project directory
- [ ] Set up .env file with credentials
- [ ] Install dependencies: npm install
- [ ] Create ./images and ./output directories
- [ ] Review HIPAA compliance requirements
- [ ] Test with sample (non-PHI) medical images
```

---

**Remember**: If processing real patient data, HIPAA compliance is **mandatory**. Consult with legal and security teams before deployment.
