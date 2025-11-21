# AGENTS.md - AI Agent Configuration for Doctors-Linc

## Overview

This document defines the AI agents used in the Doctors-Linc healthcare OCR pipeline. Each agent is specialized for specific tasks in the medical document processing workflow.

---

## Agent Hierarchy

```
MASTERLINC (Orchestrator)
├── HEALTHCARELINC (Medical Processing)
│   ├── CLINICALLINC (Clinical Decision Support)
│   └── COMPLIANCELINC (HIPAA Compliance)
├── OCRLINC (Document Processing)
└── TTLINC (Translation & Localization)
```

---

## 1. MASTERLINC - Master Orchestrator

**Purpose**: Coordinates all agents and manages the complete OCR pipeline workflow.

**Responsibilities**:
- Orchestrate multi-stage pipeline (OCR → AI Structuring → Presentation)
- Route tasks to specialized agents
- Monitor pipeline health and performance
- Handle error recovery and retries
- Aggregate results from sub-agents

**Capabilities**:
- Task delegation and prioritization
- Workflow state management
- Resource allocation
- Cross-agent communication

**Example Workflow**:
```javascript
// MASTERLINC: Coordinate full pipeline
const result = await MASTERLINC.execute({
  task: 'process_medical_images',
  images: ['./images/prescription.jpg', './images/lab-results.jpg'],
  steps: [
    { agent: 'OCRLINC', action: 'extract_text' },
    { agent: 'HEALTHCARELINC', action: 'structure_clinical_data' },
    { agent: 'COMPLIANCELINC', action: 'validate_hipaa' },
    { agent: 'TTLINC', action: 'translate_to_arabic' }
  ]
});
```

---

## 2. HEALTHCARELINC - Medical Intelligence Agent

**Purpose**: Process and structure medical content with clinical context awareness.

**Responsibilities**:
- Parse medical terminology and abbreviations
- Structure clinical data (diagnoses, medications, procedures)
- Validate medical codes (ICD-10, CPT, SNOMED CT)
- Generate FHIR R4 compliant resources
- Apply clinical reasoning

**Medical Knowledge Domains**:
- **Pharmacology**: Drug names, dosages, interactions
- **Diagnostics**: Lab results, imaging interpretations
- **Clinical Notes**: SOAP notes, progress notes, discharge summaries
- **Medical Codes**: ICD-10-CM, CPT, LOINC, SNOMED CT

**Example Usage**:
```javascript
// HEALTHCARELINC: Structure prescription data
const structured = await HEALTHCARELINC.process({
  rawText: "Metformin 500mg PO BID with meals",
  context: 'prescription',
  outputFormat: 'fhir',
  validate: true
});

// Output:
{
  resourceType: "MedicationRequest",
  medication: {
    coding: [{
      system: "http://www.nlm.nih.gov/research/umls/rxnorm",
      code: "860975",
      display: "Metformin 500 MG Oral Tablet"
    }]
  },
  dosageInstruction: [{
    timing: { repeat: { frequency: 2, period: 1, periodUnit: "d" } },
    route: { coding: [{ code: "PO", display: "Oral" }] },
    doseAndRate: [{ doseQuantity: { value: 500, unit: "mg" } }]
  }]
}
```

**Medical Terminology Mapping**:
```javascript
// HEALTHCARELINC: Expand medical abbreviations
{
  "BID": "Twice daily",
  "PO": "By mouth / Oral",
  "PRN": "As needed",
  "STAT": "Immediately",
  "NPO": "Nothing by mouth",
  "CBC": "Complete Blood Count",
  "CXR": "Chest X-Ray"
}
```

---

## 3. CLINICALLINC - Clinical Decision Support

**Purpose**: Provide clinical insights and decision support based on extracted data.

**Responsibilities**:
- Identify potential drug interactions
- Flag critical lab values
- Suggest differential diagnoses
- Check for contraindications
- Generate clinical alerts

**Clinical Rules**:
```javascript
// CLINICALLINC: Clinical alerts
const alerts = await CLINICALLINC.analyze({
  medications: ["Warfarin", "Aspirin"],
  labResults: { INR: 4.5, platelets: 50000 },
  allergies: ["Penicillin"]
});

// Output:
{
  alerts: [
    {
      level: "CRITICAL",
      message: "INR 4.5 exceeds therapeutic range (2.0-3.0). Risk of bleeding.",
      action: "Consider dose adjustment or vitamin K administration"
    },
    {
      level: "WARNING",
      message: "Warfarin + Aspirin combination increases bleeding risk",
      action: "Monitor closely for signs of bleeding"
    },
    {
      level: "CRITICAL",
      message: "Thrombocytopenia detected (50,000 platelets/μL)",
      action: "Avoid anticoagulants. Consult hematology."
    }
  ]
}
```

---

## 4. COMPLIANCELINC - HIPAA Compliance Agent

**Purpose**: Ensure all operations comply with HIPAA regulations and healthcare standards.

**Responsibilities**:
- Audit PHI access and modifications
- Enforce encryption requirements
- Validate Business Associate Agreements (BAA)
- Generate compliance reports
- Monitor security violations

**Audit Logging**:
```javascript
// COMPLIANCELINC: Log PHI access
await COMPLIANCELINC.logAccess({
  resourceType: 'Patient',
  resourceId: 'patient-12345',
  userId: 'dr-smith',
  action: 'read',
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.100',
  justification: 'Patient consultation'
});
```

**Compliance Checks**:
```javascript
// COMPLIANCELINC: Validate HIPAA compliance
const complianceReport = await COMPLIANCELINC.validate({
  operation: 'export_patient_data',
  destination: 'cloud-storage',
  encryption: 'AES-256',
  baaStatus: 'signed'
});

// Output:
{
  compliant: true,
  checks: [
    { rule: "Encryption at rest", status: "PASS" },
    { rule: "BAA in place", status: "PASS" },
    { rule: "Audit logging enabled", status: "PASS" },
    { rule: "Access controls verified", status: "PASS" }
  ],
  recommendations: [
    "Enable MFA for all users accessing PHI",
    "Schedule annual security risk assessment"
  ]
}
```

---

## 5. OCRLINC - Document Processing Agent

**Purpose**: Extract and preprocess text from medical images and documents.

**Responsibilities**:
- Perform OCR using Google Cloud Vision
- Enhance image quality (deskew, denoise, contrast)
- Detect document layouts and structures
- Extract tables, forms, and handwriting
- Confidence scoring and validation

**OCR Pipeline**:
```javascript
// OCRLINC: Process medical image
const ocrResult = await OCRLINC.extractText({
  imagePath: './images/prescription.jpg',
  preprocess: {
    deskew: true,
    denoise: true,
    contrastEnhance: true
  },
  detectHandwriting: true,
  language: ['en', 'ar']
});

// Output:
{
  text: "Prescription\nPatient: John Doe\nRx: Lisinopril 10mg PO daily",
  confidence: 0.94,
  blocks: [
    { text: "Prescription", type: "heading", confidence: 0.98 },
    { text: "Patient: John Doe", type: "field", confidence: 0.92 },
    { text: "Rx: Lisinopril 10mg PO daily", type: "medication", confidence: 0.95 }
  ],
  detectedLanguages: ['en'],
  handwritingDetected: false
}
```

**Quality Enhancement**:
```javascript
// OCRLINC: Image preprocessing
const enhanced = await OCRLINC.preprocessImage({
  imagePath: './images/blurry-notes.jpg',
  operations: [
    { type: 'deskew', angle: 'auto' },
    { type: 'denoise', strength: 0.7 },
    { type: 'sharpen', amount: 1.2 },
    { type: 'contrast', enhance: true }
  ]
});
```

---

## 6. TTLINC - Translation & Localization Agent

**Purpose**: Translate and localize medical content for bilingual support (Arabic/English).

**Responsibilities**:
- Translate medical terminology accurately
- Preserve clinical meaning across languages
- Handle RTL (Right-to-Left) layouts for Arabic
- Localize units, dates, and formats
- Maintain FHIR coding system consistency

**Translation Pipeline**:
```javascript
// TTLINC: Translate medical content
const translated = await TTLINC.translate({
  text: "Patient complains of chest pain radiating to left arm",
  sourceLang: 'en',
  targetLang: 'ar',
  domain: 'clinical',
  preserveTerminology: true
});

// Output:
{
  translatedText: "المريض يشكو من ألم في الصدر يمتد إلى الذراع الأيسر",
  confidence: 0.96,
  terminology: {
    "chest pain": "ألم في الصدر",
    "radiating": "يمتد"
  },
  direction: "rtl"
}
```

**Medical Terminology Dictionary**:
```javascript
// TTLINC: Medical term translations
const terminology = {
  "en-ar": {
    "Hypertension": "ارتفاع ضغط الدم",
    "Diabetes Mellitus": "داء السكري",
    "Myocardial Infarction": "احتشاء عضلة القلب",
    "Pneumonia": "الالتهاب الرئوي",
    "Prescription": "وصفة طبية"
  },
  "ar-en": {
    // Reverse mappings
  }
};
```

**Localization**:
```javascript
// TTLINC: Localize units and formats
const localized = await TTLINC.localize({
  value: "Patient weight: 70 kg, Height: 175 cm",
  locale: 'ar-SA',
  formatNumbers: true,
  formatDates: true
});

// Output:
{
  text: "وزن المريض: ٧٠ كجم، الطول: ١٧٥ سم",
  locale: "ar-SA",
  direction: "rtl"
}
```

---

## Agent Communication Protocol

### Message Format

```json
{
  "messageId": "uuid-v4",
  "timestamp": "2024-01-15T10:30:00Z",
  "fromAgent": "OCRLINC",
  "toAgent": "HEALTHCARELINC",
  "action": "process_extracted_text",
  "payload": {
    "text": "Patient: John Doe, DOB: 01/15/1980...",
    "confidence": 0.94,
    "metadata": {
      "imageId": "img-001",
      "documentType": "prescription"
    }
  },
  "priority": "high",
  "correlationId": "pipeline-run-12345"
}
```

### Error Handling

```javascript
// Agent error response
{
  "status": "error",
  "errorCode": "OCR_LOW_CONFIDENCE",
  "message": "OCR confidence below threshold (0.65 < 0.80)",
  "details": {
    "imagePath": "./images/poor-quality.jpg",
    "confidence": 0.65,
    "suggestions": [
      "Rescan document with better lighting",
      "Use higher resolution scan",
      "Manual review required"
    ]
  },
  "retryable": false
}
```

---

## Agent Configuration

### Environment Variables

```bash
# Agent API Keys
OPENAI_API_KEY=sk-proj-xxxx                    # For all AI agents
GOOGLE_VISION_API_KEY=AIzaSyXXXX              # For OCRLINC

# Agent Settings
HEALTHCARELINC_MODEL=gpt-4-turbo-preview
CLINICALLINC_MODEL=gpt-4
TTLINC_MODEL=gpt-4-turbo-preview
COMPLIANCELINC_AUDIT_LEVEL=strict

# Performance Tuning
AGENT_TIMEOUT_MS=30000
AGENT_MAX_RETRIES=3
AGENT_CONCURRENT_TASKS=5

# Compliance
HIPAA_AUDIT_ENABLED=true
PHI_ENCRYPTION_REQUIRED=true
BAA_VALIDATION_ENABLED=true
```

---

## Agent Metrics & Monitoring

### Key Performance Indicators (KPIs)

```javascript
// Agent performance metrics
{
  "OCRLINC": {
    "averageProcessingTime": "2.3s",
    "averageConfidence": 0.92,
    "successRate": 0.98,
    "totalProcessed": 1523
  },
  "HEALTHCARELINC": {
    "averageProcessingTime": "1.8s",
    "fhirValidationRate": 0.99,
    "successRate": 0.97,
    "totalProcessed": 1489
  },
  "COMPLIANCELINC": {
    "auditEventsLogged": 4521,
    "complianceViolations": 0,
    "averageAuditTime": "0.1s"
  }
}
```

---

## Usage Examples

### Complete Pipeline with All Agents

```javascript
// Full Doctors-Linc pipeline
async function processMedicalDocument(imagePath) {
  // Step 1: OCRLINC extracts text
  const ocrResult = await OCRLINC.extractText({ imagePath });
  
  // Step 2: HEALTHCARELINC structures clinical data
  const structured = await HEALTHCARELINC.process({
    rawText: ocrResult.text,
    outputFormat: 'fhir'
  });
  
  // Step 3: CLINICALLINC provides decision support
  const alerts = await CLINICALLINC.analyze(structured);
  
  // Step 4: COMPLIANCELINC audits the operation
  await COMPLIANCELINC.logAccess({
    resourceType: 'Patient',
    action: 'create',
    data: structured
  });
  
  // Step 5: TTLINC translates to Arabic
  const translated = await TTLINC.translate({
    text: structured.text,
    targetLang: 'ar'
  });
  
  // Step 6: MASTERLINC aggregates results
  return await MASTERLINC.aggregate({
    ocr: ocrResult,
    structured,
    alerts,
    translated
  });
}
```

---

## Agent Development Guidelines

1. **Single Responsibility**: Each agent handles one domain
2. **Stateless Operations**: Agents don't maintain state between calls
3. **Error Resilience**: Graceful degradation on failures
4. **Logging**: Comprehensive logging for debugging
5. **Testing**: Unit tests for each agent capability
6. **Documentation**: Clear API documentation for all methods

---

## Future Agent Enhancements

- **IMAGINGLINC**: Medical image analysis (X-rays, MRIs, CT scans)
- **SCHEDULINGLINC**: Appointment scheduling and reminders
- **BILLINGLINC**: Medical billing and insurance claims
- **PHARMACYLINC**: Prescription verification and drug dispensing
- **ANALYTICSLINC**: Healthcare analytics and reporting

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintainer**: Doctors-Linc Development Team
