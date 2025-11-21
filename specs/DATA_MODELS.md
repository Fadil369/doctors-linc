# Data Models - Doctors-Linc

**Version**: 1.0.0  
**Last Updated**: January 15, 2024

---

## 1. Core Domain Models

### 1.1 Document Model

```typescript
interface Document {
  id: string;                    // UUID
  userId: string;                // UUID - owner
  filename: string;              // Original filename
  filePath: string;              // Storage path
  fileSize: number;              // Bytes
  mimeType: string;              // image/jpeg, image/png
  documentType: DocumentType;    // prescription | lab_results | clinical_notes
  status: DocumentStatus;        // pending | processing | completed | failed
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

enum DocumentType {
  PRESCRIPTION = 'prescription',
  LAB_RESULTS = 'lab_results',
  CLINICAL_NOTES = 'clinical_notes',
  DISCHARGE_SUMMARY = 'discharge_summary',
  REFERRAL = 'referral',
  OTHER = 'other'
}

enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

interface DocumentMetadata {
  originalName: string;
  uploadedBy: string;
  facility?: string;
  department?: string;
  tags?: string[];
}
```

---

### 1.2 OCR Result Model

```typescript
interface OCRResult {
  id: string;                    // UUID
  documentId: string;            // Foreign key to Document
  rawText: string;               // Extracted text
  confidence: number;            // 0-1
  language: string;              // ISO code (en, ar)
  blocks: TextBlock[];           // Structured blocks
  detectedLanguages: string[];
  processingTimeMs: number;
  metadata: OCRMetadata;
  createdAt: Date;
}

interface TextBlock {
  text: string;
  type: BlockType;
  confidence: number;
  boundingBox: BoundingBox;
  words?: Word[];
}

enum BlockType {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST_ITEM = 'list_item',
  TABLE = 'table',
  FIELD = 'field',
  CODE = 'code'
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Word {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

interface OCRMetadata {
  engineVersion: string;
  imageQuality: 'low' | 'medium' | 'high';
  preprocessed: boolean;
  orientation: number;         // Detected rotation
}
```

---

### 1.3 Structured Document Model

```typescript
interface StructuredDocument {
  id: string;                    // UUID
  documentId: string;            // Foreign key to Document
  markdown: string;              // Structured markdown
  sections: Section[];           // Parsed sections
  entities: MedicalEntity[];     // Extracted entities
  confidence: number;
  createdAt: Date;
}

interface Section {
  title: string;
  content: string;
  type: SectionType;
  order: number;
}

enum SectionType {
  PATIENT_INFO = 'patient_info',
  CHIEF_COMPLAINT = 'chief_complaint',
  DIAGNOSIS = 'diagnosis',
  MEDICATIONS = 'medications',
  LAB_RESULTS = 'lab_results',
  VITAL_SIGNS = 'vital_signs',
  PROCEDURES = 'procedures',
  ALLERGIES = 'allergies',
  HISTORY = 'history',
  PHYSICAL_EXAM = 'physical_exam',
  PLAN = 'plan',
  OTHER = 'other'
}

interface MedicalEntity {
  text: string;
  type: EntityType;
  normalizedValue?: string;
  code?: MedicalCode;
  confidence: number;
}

enum EntityType {
  MEDICATION = 'medication',
  DIAGNOSIS = 'diagnosis',
  PROCEDURE = 'procedure',
  LAB_TEST = 'lab_test',
  VITAL_SIGN = 'vital_sign',
  ALLERGY = 'allergy',
  SYMPTOM = 'symptom',
  ANATOMY = 'anatomy'
}

interface MedicalCode {
  code: string;
  system: string;              // ICD-10, CPT, LOINC, RXNORM, SNOMED
  display: string;
}
```

---

### 1.4 FHIR Resource Model

```typescript
interface FHIRResource {
  id: string;                    // UUID
  documentId: string;            // Foreign key to Document
  resourceType: FHIRResourceType;
  resource: any;                 // FHIR R4 resource JSON
  valid: boolean;
  validationErrors?: string[];
  createdAt: Date;
}

enum FHIRResourceType {
  PATIENT = 'Patient',
  MEDICATION_REQUEST = 'MedicationRequest',
  OBSERVATION = 'Observation',
  CONDITION = 'Condition',
  PROCEDURE = 'Procedure',
  ALLERGY_INTOLERANCE = 'AllergyIntolerance',
  DIAGNOSTIC_REPORT = 'DiagnosticReport'
}
```

---

### 1.5 Presentation Model

```typescript
interface Presentation {
  id: string;                    // UUID
  userId: string;                // Owner
  documentIds: string[];         // Source documents
  filePath: string;              // .pptx file location
  slideCount: number;
  template: string;              // Template name
  language: string;              // en | ar
  metadata: PresentationMetadata;
  createdAt: Date;
  expiresAt: Date;               // Auto-delete after expiration
}

interface PresentationMetadata {
  title?: string;
  author?: string;
  facility?: string;
  includeImages: boolean;
  fontSize: number;
  theme: string;
}
```

---

### 1.6 User Model

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  passwordHash: string;          // bcrypt hash
  firstName: string;
  lastName: string;
  role: UserRole;
  facility?: string;
  department?: string;
  language: string;              // Preferred language (en | ar)
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  MEDICAL_RECORDS = 'medical_records',
  COMPLIANCE_OFFICER = 'compliance_officer',
  VIEWER = 'viewer'
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}
```

---

### 1.7 Audit Log Model (HIPAA)

```typescript
interface AuditLog {
  id: string;                    // UUID
  userId: string;                // Who performed the action
  resourceType: string;          // Document, Patient, etc.
  resourceId: string;            // ID of the resource
  action: AuditAction;
  ipAddress: string;
  userAgent: string;
  justification?: string;        // Why accessed
  metadata?: any;
  timestamp: Date;
}

enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  PRINT = 'print',
  SHARE = 'share'
}
```

---

## 2. Medical Domain Models

### 2.1 Medication Model

```typescript
interface Medication {
  name: string;
  dose: number;
  unit: string;                  // mg, ml, mcg
  route: MedicationRoute;
  frequency: string;             // BID, TID, QD, PRN
  duration?: string;
  instructions?: string;
  rxNormCode?: string;
}

enum MedicationRoute {
  ORAL = 'PO',
  INTRAVENOUS = 'IV',
  INTRAMUSCULAR = 'IM',
  SUBCUTANEOUS = 'SC',
  SUBLINGUAL = 'SL',
  TOPICAL = 'TOP',
  INHALED = 'INH',
  RECTAL = 'PR'
}
```

---

### 2.2 Lab Result Model

```typescript
interface LabResult {
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag: LabFlag;
  loincCode?: string;
  performedAt?: Date;
  orderedBy?: string;
}

enum LabFlag {
  NORMAL = 'normal',
  LOW = 'low',
  HIGH = 'high',
  CRITICAL_LOW = 'critical_low',
  CRITICAL_HIGH = 'critical_high',
  ABNORMAL = 'abnormal'
}
```

---

### 2.3 Vital Signs Model

```typescript
interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    unit: 'mmHg';
  };
  heartRate?: {
    value: number;
    unit: 'bpm';
  };
  temperature?: {
    value: number;
    unit: 'C' | 'F';
  };
  respiratoryRate?: {
    value: number;
    unit: 'breaths/min';
  };
  oxygenSaturation?: {
    value: number;
    unit: '%';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  height?: {
    value: number;
    unit: 'cm' | 'in';
  };
  bmi?: number;
  recordedAt: Date;
}
```

---

## 3. Processing Models

### 3.1 Pipeline Job Model

```typescript
interface PipelineJob {
  id: string;                    // UUID
  userId: string;
  documentId: string;
  status: JobStatus;
  stages: PipelineStage[];
  priority: JobPriority;
  retryCount: number;
  maxRetries: number;
  error?: JobError;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface PipelineStage {
  name: string;
  status: StageStatus;
  progress: number;              // 0-100
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

enum StageStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface JobError {
  code: string;
  message: string;
  stack?: string;
  retryable: boolean;
}
```

---

### 3.2 Batch Processing Model

```typescript
interface BatchJob {
  id: string;                    // UUID
  userId: string;
  name: string;
  documentIds: string[];
  status: BatchStatus;
  progress: BatchProgress;
  options: BatchOptions;
  createdAt: Date;
  completedAt?: Date;
}

enum BatchStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PARTIALLY_FAILED = 'partially_failed',
  FAILED = 'failed'
}

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  percentage: number;
}

interface BatchOptions {
  priority: JobPriority;
  continueOnError: boolean;
  generateReport: boolean;
  notifyOnCompletion: boolean;
}
```

---

## 4. Translation Models

### 4.1 Translation Model

```typescript
interface Translation {
  id: string;                    // UUID
  documentId: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;            // ISO code
  targetLang: string;            // ISO code
  direction: 'ltr' | 'rtl';
  confidence: number;
  preservedTerms: Record<string, string>;
  createdAt: Date;
}
```

---

## 5. Configuration Models

### 5.1 System Configuration

```typescript
interface SystemConfig {
  ocr: OCRConfig;
  ai: AIConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  compliance: ComplianceConfig;
}

interface OCRConfig {
  provider: 'google_vision';
  confidence_threshold: number;
  supported_languages: string[];
  max_file_size_mb: number;
  preprocessing_enabled: boolean;
}

interface AIConfig {
  provider: 'openai';
  model: string;
  temperature: number;
  max_tokens: number;
  timeout_ms: number;
}

interface StorageConfig {
  provider: 's3' | 'local';
  bucket?: string;
  retention_days: number;
  encryption_enabled: boolean;
}

interface SecurityConfig {
  jwt_expiration: number;
  mfa_enabled: boolean;
  password_min_length: number;
  session_timeout_minutes: number;
}

interface ComplianceConfig {
  hipaa_enabled: boolean;
  audit_retention_years: number;
  phi_encryption_required: boolean;
  baa_required: boolean;
}
```

---

## 6. Example Data

### Example Document

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "prescription_20240115.jpg",
  "filePath": "/uploads/2024/01/15/550e8400.jpg",
  "fileSize": 1048576,
  "mimeType": "image/jpeg",
  "documentType": "prescription",
  "status": "completed",
  "metadata": {
    "originalName": "Dr_Smith_Prescription.jpg",
    "uploadedBy": "Dr. Sarah Ahmad",
    "facility": "King Fahd Hospital",
    "department": "Cardiology",
    "tags": ["urgent", "follow-up"]
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:45Z"
}
```

### Example OCR Result

```json
{
  "id": "660f9511-f39c-52e5-b827-557766551111",
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "rawText": "Prescription\n\nPatient: John Doe\nDOB: 01/15/1980\n\nRx:\n1. Metformin 500mg PO BID\n2. Lisinopril 10mg PO daily",
  "confidence": 0.94,
  "language": "en",
  "blocks": [
    {
      "text": "Prescription",
      "type": "heading",
      "confidence": 0.98,
      "boundingBox": { "x": 10, "y": 20, "width": 200, "height": 30 }
    }
  ],
  "detectedLanguages": ["en"],
  "processingTimeMs": 2345,
  "metadata": {
    "engineVersion": "4.0.0",
    "imageQuality": "high",
    "preprocessed": true,
    "orientation": 0
  },
  "createdAt": "2024-01-15T10:30:15Z"
}
```

---

**Last Updated**: January 15, 2024  
**Version**: 1.0.0  
**Maintainer**: Doctors-Linc Engineering Team
