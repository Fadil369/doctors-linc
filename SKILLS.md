# SKILLS.md - Core Skills for Doctors-Linc System

## Overview

This document defines the core skills and capabilities of the Doctors-Linc OCR pipeline system. Skills represent atomic, reusable functions that agents use to accomplish tasks.

---

## Skill Categories

1. **OCR Skills** - Text extraction and image processing
2. **Medical Processing Skills** - Clinical data structuring
3. **FHIR Skills** - FHIR resource creation and validation
4. **Translation Skills** - Multilingual support
5. **Presentation Skills** - PowerPoint generation
6. **Compliance Skills** - HIPAA and audit operations
7. **Utility Skills** - Helper functions

---

## 1. OCR Skills

### Skill: `extract_text_from_image`

**Purpose**: Extract text from medical images using Google Cloud Vision API.

**Input**:
```json
{
  "imagePath": "string",
  "language": ["string"],
  "detectHandwriting": "boolean",
  "enhanceQuality": "boolean"
}
```

**Output**:
```json
{
  "text": "string",
  "confidence": "number (0-1)",
  "blocks": [
    {
      "text": "string",
      "type": "string",
      "boundingBox": { "x": 0, "y": 0, "width": 100, "height": 50 },
      "confidence": "number"
    }
  ],
  "detectedLanguages": ["string"]
}
```

**Implementation**:
```javascript
async function extract_text_from_image({ imagePath, language = ['en'], detectHandwriting = true, enhanceQuality = false }) {
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  
  if (enhanceQuality) {
    imagePath = await enhance_image_quality({ imagePath });
  }
  
  const [result] = await client.documentTextDetection(imagePath);
  const fullText = result.fullTextAnnotation;
  
  return {
    text: fullText.text,
    confidence: calculateAverageConfidence(fullText),
    blocks: extractBlocks(fullText),
    detectedLanguages: language
  };
}
```

---

### Skill: `enhance_image_quality`

**Purpose**: Improve image quality before OCR processing.

**Input**:
```json
{
  "imagePath": "string",
  "operations": [
    { "type": "deskew|denoise|sharpen|contrast", "params": {} }
  ]
}
```

**Output**:
```json
{
  "enhancedImagePath": "string",
  "improvements": {
    "deskewed": "boolean",
    "denoised": "boolean",
    "sharpened": "boolean"
  }
}
```

---

### Skill: `detect_document_type`

**Purpose**: Classify the type of medical document.

**Input**:
```json
{
  "text": "string",
  "imageFeatures": {}
}
```

**Output**:
```json
{
  "documentType": "prescription|lab_results|clinical_notes|discharge_summary|referral",
  "confidence": "number",
  "detectedFields": ["string"]
}
```

**Example**:
```javascript
const docType = await detect_document_type({
  text: "Prescription\nPatient Name: John Doe\nRx: Metformin 500mg"
});
// Output: { documentType: "prescription", confidence: 0.95 }
```

---

## 2. Medical Processing Skills

### Skill: `parse_medication_order`

**Purpose**: Extract structured medication information from text.

**Input**:
```json
{
  "text": "string",
  "context": "prescription|medication_list"
}
```

**Output**:
```json
{
  "medication": {
    "name": "string",
    "dose": "number",
    "unit": "string",
    "route": "string",
    "frequency": "string",
    "duration": "string",
    "rxNormCode": "string"
  }
}
```

**Example**:
```javascript
const medication = await parse_medication_order({
  text: "Lisinopril 10mg PO daily x 30 days"
});

// Output:
{
  medication: {
    name: "Lisinopril",
    dose: 10,
    unit: "mg",
    route: "PO (Oral)",
    frequency: "daily",
    duration: "30 days",
    rxNormCode: "314076"
  }
}
```

---

### Skill: `parse_lab_results`

**Purpose**: Extract and structure laboratory test results.

**Input**:
```json
{
  "text": "string",
  "testType": "CBC|CMP|lipid_panel|custom"
}
```

**Output**:
```json
{
  "tests": [
    {
      "testName": "string",
      "value": "number",
      "unit": "string",
      "referenceRange": "string",
      "flag": "normal|high|low|critical",
      "loincCode": "string"
    }
  ]
}
```

**Example**:
```javascript
const labResults = await parse_lab_results({
  text: "Glucose: 120 mg/dL (70-100)\nHbA1c: 6.5% (4.0-5.6)"
});

// Output:
{
  tests: [
    {
      testName: "Glucose",
      value: 120,
      unit: "mg/dL",
      referenceRange: "70-100",
      flag: "high",
      loincCode: "2345-7"
    },
    {
      testName: "HbA1c",
      value: 6.5,
      unit: "%",
      referenceRange: "4.0-5.6",
      flag: "high",
      loincCode: "4548-4"
    }
  ]
}
```

---

### Skill: `expand_medical_abbreviations`

**Purpose**: Expand common medical abbreviations to full terms.

**Input**:
```json
{
  "text": "string",
  "context": "clinical|pharmacy|laboratory"
}
```

**Output**:
```json
{
  "expandedText": "string",
  "abbreviations": {
    "abbreviation": "expansion"
  }
}
```

**Abbreviation Dictionary**:
```javascript
const MEDICAL_ABBREVIATIONS = {
  // Dosing
  "BID": "Twice daily",
  "TID": "Three times daily",
  "QID": "Four times daily",
  "QD": "Once daily",
  "PRN": "As needed",
  "AC": "Before meals",
  "PC": "After meals",
  "HS": "At bedtime",
  
  // Routes
  "PO": "By mouth / Oral",
  "IV": "Intravenous",
  "IM": "Intramuscular",
  "SC": "Subcutaneous",
  "SL": "Sublingual",
  
  // Clinical
  "SOB": "Shortness of breath",
  "HTN": "Hypertension",
  "DM": "Diabetes Mellitus",
  "CAD": "Coronary Artery Disease",
  "CHF": "Congestive Heart Failure",
  "COPD": "Chronic Obstructive Pulmonary Disease",
  
  // Laboratory
  "CBC": "Complete Blood Count",
  "CMP": "Comprehensive Metabolic Panel",
  "BMP": "Basic Metabolic Panel",
  "PT": "Prothrombin Time",
  "INR": "International Normalized Ratio",
  "ESR": "Erythrocyte Sedimentation Rate",
  "CRP": "C-Reactive Protein"
};
```

---

### Skill: `validate_medical_code`

**Purpose**: Validate and lookup medical coding (ICD-10, CPT, LOINC).

**Input**:
```json
{
  "code": "string",
  "codeSystem": "ICD10|CPT|LOINC|SNOMED|RXNORM"
}
```

**Output**:
```json
{
  "valid": "boolean",
  "code": "string",
  "display": "string",
  "system": "string",
  "category": "string"
}
```

**Example**:
```javascript
const validated = await validate_medical_code({
  code: "E11.9",
  codeSystem: "ICD10"
});

// Output:
{
  valid: true,
  code: "E11.9",
  display: "Type 2 diabetes mellitus without complications",
  system: "http://hl7.org/fhir/sid/icd-10-cm",
  category: "Endocrine, nutritional and metabolic diseases"
}
```

---

## 3. FHIR Skills

### Skill: `create_fhir_patient`

**Purpose**: Create FHIR R4 Patient resource from extracted data.

**Input**:
```json
{
  "givenName": "string",
  "familyName": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "male|female|other|unknown",
  "nationalId": "string",
  "country": "SD|SA"
}
```

**Output**:
```json
{
  "resourceType": "Patient",
  "identifier": [...],
  "name": [...],
  "gender": "string",
  "birthDate": "string"
}
```

**Implementation**:
```javascript
const { Patient } = require('fhir.resources');

async function create_fhir_patient({ givenName, familyName, birthDate, gender, nationalId, country = 'SD' }) {
  const oidBase = country === 'SD' 
    ? '1.3.6.1.4.1.61026.1.1'  // Sudan patients
    : '1.3.6.1.4.1.61026.2.1'; // Saudi patients
  
  const patient = new Patient({
    identifier: [{
      system: `urn:oid:${oidBase}`,
      value: nationalId,
      type: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/v2-0203",
          code: "NI",
          display: "National Identifier"
        }]
      }
    }],
    name: [{
      given: [givenName],
      family: familyName,
      use: "official"
    }],
    gender: gender,
    birthDate: birthDate
  });
  
  patient.validate();
  return patient;
}
```

---

### Skill: `create_fhir_medication_request`

**Purpose**: Create FHIR MedicationRequest from prescription data.

**Input**:
```json
{
  "medicationName": "string",
  "dose": "number",
  "unit": "string",
  "frequency": "string",
  "route": "string",
  "patientReference": "string"
}
```

**Output**:
```json
{
  "resourceType": "MedicationRequest",
  "status": "active",
  "intent": "order",
  "medication": {...},
  "dosageInstruction": [...]
}
```

---

### Skill: `create_fhir_observation`

**Purpose**: Create FHIR Observation for lab results or vital signs.

**Input**:
```json
{
  "testName": "string",
  "value": "number",
  "unit": "string",
  "referenceRange": "string",
  "loincCode": "string",
  "patientReference": "string"
}
```

**Output**:
```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {...},
  "value": {...},
  "referenceRange": [...]
}
```

---

### Skill: `validate_fhir_resource`

**Purpose**: Validate FHIR resource against R4 schema.

**Input**:
```json
{
  "resource": {},
  "resourceType": "Patient|Observation|MedicationRequest|..."
}
```

**Output**:
```json
{
  "valid": "boolean",
  "errors": ["string"],
  "warnings": ["string"]
}
```

---

## 4. Translation Skills

### Skill: `translate_medical_text`

**Purpose**: Translate medical content with terminology preservation.

**Input**:
```json
{
  "text": "string",
  "sourceLang": "en|ar",
  "targetLang": "en|ar",
  "domain": "clinical|pharmacy|laboratory"
}
```

**Output**:
```json
{
  "translatedText": "string",
  "confidence": "number",
  "direction": "ltr|rtl",
  "preservedTerms": {}
}
```

---

### Skill: `localize_medical_units`

**Purpose**: Convert and localize medical units (imperial/metric).

**Input**:
```json
{
  "value": "number",
  "unit": "string",
  "targetLocale": "en-US|ar-SA"
}
```

**Output**:
```json
{
  "value": "number",
  "unit": "string",
  "formatted": "string"
}
```

**Example**:
```javascript
// Convert lbs to kg for Saudi locale
const localized = await localize_medical_units({
  value: 154,
  unit: "lbs",
  targetLocale: "ar-SA"
});

// Output: { value: 70, unit: "kg", formatted: "٧٠ كجم" }
```

---

## 5. Presentation Skills

### Skill: `generate_powerpoint`

**Purpose**: Generate PowerPoint presentation from Markdown content.

**Input**:
```json
{
  "markdownFiles": ["string"],
  "templatePath": "string",
  "outputPath": "string",
  "options": {
    "font": "string",
    "fontSize": "number",
    "includeImages": "boolean"
  }
}
```

**Output**:
```json
{
  "presentationPath": "string",
  "slideCount": "number",
  "generatedAt": "ISO8601"
}
```

**Implementation**:
```javascript
const PptxGenJS = require('pptxgenjs');

async function generate_powerpoint({ markdownFiles, outputPath, options = {} }) {
  const pres = new PptxGenJS();
  
  for (const mdFile of markdownFiles) {
    const markdown = await fs.readFile(mdFile, 'utf-8');
    const slide = pres.addSlide();
    
    // Title from first heading
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] || 'Medical Document';
    slide.addText(title, { x: 1, y: 0.5, fontSize: 24, bold: true });
    
    // Content
    slide.addText(markdown, {
      x: 0.5, y: 1.5, w: '90%', h: '70%',
      fontFace: options.font || 'Courier New',
      fontSize: options.fontSize || 12
    });
  }
  
  await pres.writeFile({ fileName: outputPath });
  
  return {
    presentationPath: outputPath,
    slideCount: pres.slides.length,
    generatedAt: new Date().toISOString()
  };
}
```

---

### Skill: `convert_markdown_to_slides`

**Purpose**: Convert structured Markdown into presentation slides.

**Input**:
```json
{
  "markdown": "string",
  "slideLayout": "title|content|two_column|image"
}
```

**Output**:
```json
{
  "slides": [
    {
      "type": "string",
      "title": "string",
      "content": "string",
      "layout": "string"
    }
  ]
}
```

---

## 6. Compliance Skills

### Skill: `log_phi_access`

**Purpose**: Log access to Protected Health Information for HIPAA compliance.

**Input**:
```json
{
  "resourceType": "string",
  "resourceId": "string",
  "userId": "string",
  "action": "create|read|update|delete",
  "timestamp": "ISO8601",
  "ipAddress": "string"
}
```

**Output**:
```json
{
  "auditId": "string",
  "logged": "boolean",
  "timestamp": "ISO8601"
}
```

---

### Skill: `encrypt_phi_field`

**Purpose**: Encrypt PHI fields before storage.

**Input**:
```json
{
  "value": "string",
  "fieldType": "ssn|national_id|name|dob"
}
```

**Output**:
```json
{
  "encrypted": "string",
  "algorithm": "AES-256-GCM",
  "iv": "string"
}
```

---

### Skill: `validate_baa_compliance`

**Purpose**: Validate Business Associate Agreement compliance for third-party services.

**Input**:
```json
{
  "service": "google_vision|openai|aws",
  "operation": "string"
}
```

**Output**:
```json
{
  "compliant": "boolean",
  "baaStatus": "signed|pending|not_required",
  "warnings": ["string"]
}
```

---

## 7. Utility Skills

### Skill: `calculate_confidence_score`

**Purpose**: Calculate overall confidence score for multi-stage pipeline.

**Input**:
```json
{
  "scores": {
    "ocr": "number",
    "structuring": "number",
    "validation": "number"
  },
  "weights": {
    "ocr": 0.4,
    "structuring": 0.4,
    "validation": 0.2
  }
}
```

**Output**:
```json
{
  "overallConfidence": "number",
  "breakdown": {}
}
```

---

### Skill: `detect_language`

**Purpose**: Detect language of input text.

**Input**:
```json
{
  "text": "string"
}
```

**Output**:
```json
{
  "language": "en|ar|...",
  "confidence": "number",
  "direction": "ltr|rtl"
}
```

---

### Skill: `sanitize_filename`

**Purpose**: Create safe filenames from document content.

**Input**:
```json
{
  "text": "string",
  "maxLength": "number"
}
```

**Output**:
```json
{
  "filename": "string",
  "extension": "md|txt|json"
}
```

---

## Skill Composition Examples

### Example 1: Complete Prescription Processing

```javascript
async function processPrescription(imagePath) {
  // Step 1: Extract text
  const ocrResult = await extract_text_from_image({ imagePath });
  
  // Step 2: Detect document type
  const docType = await detect_document_type({ text: ocrResult.text });
  
  // Step 3: Parse medication
  const medication = await parse_medication_order({ text: ocrResult.text });
  
  // Step 4: Expand abbreviations
  const expanded = await expand_medical_abbreviations({ 
    text: medication.medication.frequency 
  });
  
  // Step 5: Create FHIR resource
  const fhirMedRequest = await create_fhir_medication_request({
    ...medication.medication,
    patientReference: "Patient/12345"
  });
  
  // Step 6: Validate FHIR
  const validation = await validate_fhir_resource({
    resource: fhirMedRequest,
    resourceType: "MedicationRequest"
  });
  
  // Step 7: Log access
  await log_phi_access({
    resourceType: "MedicationRequest",
    action: "create",
    userId: "dr-smith"
  });
  
  return {
    ocr: ocrResult,
    medication,
    fhir: fhirMedRequest,
    valid: validation.valid
  };
}
```

---

## Skill Development Guidelines

1. **Atomic Operations**: Each skill does one thing well
2. **Clear Inputs/Outputs**: Well-defined JSON schemas
3. **Error Handling**: Return errors instead of throwing
4. **Validation**: Validate all inputs before processing
5. **Logging**: Log skill execution for debugging
6. **Testing**: Unit test each skill independently
7. **Documentation**: Provide examples and use cases

---

## Skill Testing

```javascript
// Example skill test
describe('parse_medication_order', () => {
  it('should parse simple medication order', async () => {
    const result = await parse_medication_order({
      text: "Metformin 500mg PO BID"
    });
    
    expect(result.medication.name).toBe('Metformin');
    expect(result.medication.dose).toBe(500);
    expect(result.medication.unit).toBe('mg');
    expect(result.medication.route).toBe('PO (Oral)');
    expect(result.medication.frequency).toBe('BID (Twice daily)');
  });
});
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Total Skills**: 20+  
**Maintainer**: Doctors-Linc Development Team

---

## Custom Agent Skills (Anthropic Format)

### Overview

We've integrated custom skills following [Anthropic's Agent Skills Spec](https://github.com/anthropics/skills) to enhance our medical OCR pipeline. These skills are located in `src/skills/` and follow the standard SKILL.md format.

### Available Custom Skills

#### 1. Medical-OCR Skill (`src/skills/medical-ocr/`)
- **Purpose**: Medical document OCR processing with clinical entity extraction
- **Features**: Google Cloud Vision OCR, medical NLP, FHIR compliance
- **Use Cases**: Prescriptions, lab results, clinical notes processing
- **HIPAA**: ✓ | **FHIR**: ✓

#### 2. FHIR-Generator Skill (`src/skills/fhir-generator/`)
- **Purpose**: FHIR R4 resource generation and validation
- **Features**: Patient, MedicationRequest, Observation, Condition resources
- **Coding Systems**: LOINC, SNOMED, RxNorm, ICD-10, CPT
- **HIPAA**: ✓ | **FHIR**: ✓

#### 3. PPTX-Medical Skill (`src/skills/pptx-medical/`)
- **Purpose**: Professional medical PowerPoint generation
- **Features**: Patient summaries, lab visualizations, care plans
- **Templates**: Healthcare color palettes, HIPAA notices
- **HIPAA**: ✓ | **FHIR**: ✓

### Skill Integration Pipeline

```
Medical Image
     ↓
[Medical-OCR Skill]
Extract text + entities
     ↓
[FHIR-Generator Skill]
Create FHIR resources
     ↓
[PPTX-Medical Skill]
Generate presentation
     ↓
Clinical PowerPoint
```

### Medical Coding Systems

| System | Purpose | URL |
|--------|---------|-----|
| LOINC | Lab tests, observations | https://loinc.org/ |
| SNOMED CT | Clinical terminology | https://www.snomed.org/ |
| RxNorm | Medications | https://www.nlm.nih.gov/research/umls/rxnorm/ |
| ICD-10-CM | Diagnoses | https://www.cdc.gov/nchs/icd/icd-10-cm.htm |

### Reference

Based on skills from https://github.com/anthropics/skills
- Document skills (PDF, PPTX, DOCX, XLSX)
- Custom healthcare adaptations
- HIPAA-compliant workflows

