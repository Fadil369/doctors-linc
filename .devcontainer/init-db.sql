-- Initialize Doctors-Linc Database
-- This script runs automatically when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for application
CREATE SCHEMA IF NOT EXISTS doctors_linc;

-- Set default schema
SET search_path TO doctors_linc, public;

-- Create tables for audit logging (HIPAA compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    justification TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on audit logs for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- Create table for processed documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    ocr_confidence DECIMAL(5,4),
    status VARCHAR(50) DEFAULT 'processing',
    raw_text TEXT,
    structured_data JSONB,
    fhir_resources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Create index on documents
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- Create table for processing jobs
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on jobs
CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_document ON processing_jobs(document_id);

-- Create table for FHIR resources
CREATE TABLE IF NOT EXISTS fhir_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    fhir_version VARCHAR(20) DEFAULT 'R4',
    resource_data JSONB NOT NULL,
    validation_status VARCHAR(50),
    validation_errors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on FHIR resources
CREATE INDEX IF NOT EXISTS idx_fhir_resource_type ON fhir_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_fhir_document ON fhir_resources(document_id);

-- Create table for translations
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT,
    confidence DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on translations
CREATE INDEX IF NOT EXISTS idx_translations_document ON translations(document_id);
CREATE INDEX IF NOT EXISTS idx_translations_languages ON translations(source_language, target_language);

-- Create table for medical terminology cache
CREATE TABLE IF NOT EXISTS terminology_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL,
    translation VARCHAR(255),
    code_system VARCHAR(100),
    code VARCHAR(100),
    display TEXT,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(term, language, code_system)
);

-- Create index on terminology
CREATE INDEX IF NOT EXISTS idx_terminology_term ON terminology_cache(term, language);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fhir_resources_updated_at BEFORE UPDATE ON fhir_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA doctors_linc TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA doctors_linc TO postgres;

-- Insert initial data
INSERT INTO terminology_cache (term, language, translation, code_system) VALUES
    ('BID', 'en', 'Twice daily', 'dosing'),
    ('TID', 'en', 'Three times daily', 'dosing'),
    ('QID', 'en', 'Four times daily', 'dosing'),
    ('PO', 'en', 'By mouth / Oral', 'route'),
    ('IV', 'en', 'Intravenous', 'route')
ON CONFLICT DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Doctors-Linc database initialized successfully';
END $$;
