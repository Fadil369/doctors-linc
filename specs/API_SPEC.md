# API Specification - Doctors-Linc

**Version**: 1.0.0  
**Base URL**: `https://api.doctors-linc.com/v1`  
**Protocol**: REST  
**Format**: JSON

---

## Authentication

All API requests require authentication using JWT tokens.

### Get Access Token

```http
POST /auth/token
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Usage**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoints

### 1. OCR Processing

#### Process Single Image

```http
POST /ocr/process
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary>
language: "en" | "ar" | "en,ar"
enhance_quality: boolean (optional)
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "document_id": "doc_abc123",
    "text": "Extracted text content...",
    "confidence": 0.94,
    "language": "en",
    "blocks": [
      {
        "text": "Patient Name: John Doe",
        "type": "field",
        "confidence": 0.96,
        "bounding_box": {
          "x": 10,
          "y": 20,
          "width": 200,
          "height": 30
        }
      }
    ],
    "processing_time_ms": 2345,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "File must be PNG, JPG, or JPEG",
    "details": {
      "received_format": "pdf",
      "allowed_formats": ["png", "jpg", "jpeg"]
    }
  }
}
```

---

#### Process Batch

```http
POST /ocr/batch
Authorization: Bearer {token}
Content-Type: multipart/form-data

files[]: <binary>[]
language: "en" | "ar"
priority: "low" | "normal" | "high"
```

**Response** (202 Accepted):
```json
{
  "status": "processing",
  "data": {
    "batch_id": "batch_xyz789",
    "total_files": 25,
    "estimated_completion_time": "2024-01-15T10:45:00Z",
    "status_url": "/ocr/batch/batch_xyz789/status"
  }
}
```

---

#### Get Batch Status

```http
GET /ocr/batch/{batch_id}/status
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "batch_id": "batch_xyz789",
    "status": "processing",
    "progress": {
      "total": 25,
      "completed": 15,
      "failed": 1,
      "pending": 9,
      "percentage": 60
    },
    "results": [
      {
        "file_name": "prescription_01.jpg",
        "document_id": "doc_abc123",
        "status": "completed",
        "confidence": 0.94
      },
      {
        "file_name": "prescription_02.jpg",
        "status": "failed",
        "error": "Low image quality"
      }
    ],
    "estimated_completion_time": "2024-01-15T10:45:00Z"
  }
}
```

---

### 2. Document Structuring

#### Structure Text to Markdown

```http
POST /documents/structure
Authorization: Bearer {token}
Content-Type: application/json

{
  "document_id": "doc_abc123",
  "text": "Patient Name: John Doe...",
  "document_type": "prescription" | "lab_results" | "clinical_notes",
  "expand_abbreviations": boolean,
  "output_format": "markdown" | "json"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "structured_id": "struct_def456",
    "markdown": "## Patient Information\n\n- **Name**: John Doe\n...",
    "sections": [
      {
        "title": "Patient Information",
        "content": "Name: John Doe\nDOB: 01/15/1980",
        "type": "patient_info"
      },
      {
        "title": "Medications",
        "content": "1. Metformin 500mg PO BID\n2. Lisinopril 10mg PO daily",
        "type": "medications"
      }
    ],
    "processing_time_ms": 1823,
    "created_at": "2024-01-15T10:31:00Z"
  }
}
```

---

### 3. FHIR Resources

#### Create FHIR Patient

```http
POST /fhir/Patient
Authorization: Bearer {token}
Content-Type: application/json

{
  "given_name": "John",
  "family_name": "Doe",
  "birth_date": "1980-01-15",
  "gender": "male",
  "national_id": "1234567890",
  "country": "SA"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "resourceType": "Patient",
    "id": "patient_123",
    "identifier": [
      {
        "system": "urn:oid:1.3.6.1.4.1.61026.2.1",
        "value": "1234567890",
        "type": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
              "code": "NI",
              "display": "National Identifier"
            }
          ]
        }
      }
    ],
    "name": [
      {
        "given": ["John"],
        "family": "Doe",
        "use": "official"
      }
    ],
    "gender": "male",
    "birthDate": "1980-01-15"
  }
}
```

---

#### Create FHIR MedicationRequest

```http
POST /fhir/MedicationRequest
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_reference": "Patient/patient_123",
  "medication_name": "Metformin",
  "dose": 500,
  "unit": "mg",
  "route": "PO",
  "frequency": "BID",
  "duration": "30 days"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "resourceType": "MedicationRequest",
    "id": "medrq_456",
    "status": "active",
    "intent": "order",
    "medication": {
      "coding": [
        {
          "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code": "860975",
          "display": "Metformin 500 MG Oral Tablet"
        }
      ]
    },
    "subject": {
      "reference": "Patient/patient_123"
    },
    "dosageInstruction": [
      {
        "timing": {
          "repeat": {
            "frequency": 2,
            "period": 1,
            "periodUnit": "d"
          }
        },
        "route": {
          "coding": [
            {
              "code": "PO",
              "display": "Oral"
            }
          ]
        },
        "doseAndRate": [
          {
            "doseQuantity": {
              "value": 500,
              "unit": "mg"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 4. Presentation Generation

#### Generate PowerPoint

```http
POST /presentations/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "document_ids": ["doc_abc123", "doc_def456"],
  "template": "default" | "hospital_branded",
  "language": "en" | "ar",
  "include_images": boolean,
  "font_size": 12
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "presentation_id": "pres_ghi789",
    "slide_count": 10,
    "file_size_bytes": 245760,
    "download_url": "/presentations/pres_ghi789/download",
    "expires_at": "2024-01-16T10:30:00Z",
    "created_at": "2024-01-15T10:32:00Z"
  }
}
```

---

#### Download Presentation

```http
GET /presentations/{presentation_id}/download
Authorization: Bearer {token}
```

**Response** (200 OK):
```http
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="medical_presentation_20240115.pptx"

<binary data>
```

---

### 5. Translation

#### Translate Text

```http
POST /translation/translate
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Patient complains of chest pain",
  "source_lang": "en",
  "target_lang": "ar",
  "domain": "clinical",
  "preserve_terminology": true
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "translated_text": "المريض يشكو من ألم في الصدر",
    "confidence": 0.96,
    "direction": "rtl",
    "terminology_preserved": {
      "chest pain": "ألم في الصدر"
    }
  }
}
```

---

### 6. Compliance & Audit

#### Log PHI Access

```http
POST /audit/log
Authorization: Bearer {token}
Content-Type: application/json

{
  "resource_type": "Patient",
  "resource_id": "patient_123",
  "action": "read" | "create" | "update" | "delete",
  "user_id": "dr_smith",
  "justification": "Patient consultation"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "audit_id": "audit_jkl012",
    "timestamp": "2024-01-15T10:30:00Z",
    "logged": true
  }
}
```

---

#### Get Audit Trail

```http
GET /audit/trail?resource_id=patient_123&start_date=2024-01-01&end_date=2024-01-15
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "resource_id": "patient_123",
    "total_events": 25,
    "events": [
      {
        "audit_id": "audit_jkl012",
        "action": "read",
        "user_id": "dr_smith",
        "timestamp": "2024-01-15T10:30:00Z",
        "ip_address": "192.168.1.100",
        "justification": "Patient consultation"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_pages": 2
    }
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_FORMAT` | 400 | Unsupported file format |
| `FILE_TOO_LARGE` | 400 | File exceeds maximum size (10MB) |
| `INVALID_CREDENTIALS` | 401 | Authentication failed |
| `UNAUTHORIZED` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `OCR_FAILED` | 500 | OCR processing error |
| `AI_PROCESSING_FAILED` | 500 | AI structuring error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limits

| Plan | Requests/Minute | Daily Limit |
|------|-----------------|-------------|
| Free | 10 | 100 |
| Basic | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Unlimited | Unlimited |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705318200
```

---

## Webhooks

Subscribe to events for asynchronous notifications.

### Event Types

- `ocr.completed` - OCR processing completed
- `ocr.failed` - OCR processing failed
- `batch.completed` - Batch processing completed
- `presentation.generated` - Presentation created

### Webhook Payload

```json
{
  "event": "ocr.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "document_id": "doc_abc123",
    "status": "completed",
    "confidence": 0.94
  }
}
```

---

**Last Updated**: January 15, 2024  
**API Version**: 1.0.0
