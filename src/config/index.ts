/**
 * Application Configuration
 */

export const config = {
  // Environment
  nodeEnv: process.env['NODE_ENV'] || 'development',
  isDevelopment: process.env['NODE_ENV'] === 'development',
  isProduction: process.env['NODE_ENV'] === 'production',
  port: parseInt(process.env['PORT'] || '3000', 10),
  logLevel: process.env['LOG_LEVEL'] || 'info',

  // Google Cloud Vision
  googleCloud: {
    credentialsPath: process.env['GOOGLE_APPLICATION_CREDENTIALS'],
    credentialsJson: process.env['GOOGLE_CLOUD_CREDENTIALS_JSON'],
  },

  // OpenAI
  openai: {
    apiKey: process.env['OPENAI_API_KEY'] || '',
    model: process.env['OPENAI_MODEL'] || 'gpt-4-turbo-preview',
    temperature: parseFloat(process.env['OPENAI_TEMPERATURE'] || '0.3'),
    maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2048', 10),
  },

  // Database
  database: {
    url: process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/doctors_linc',
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'] || 'doctors_linc',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'postgres',
    ssl: process.env['DB_SSL'] === 'true',
    poolMin: parseInt(process.env['DB_POOL_MIN'] || '2', 10),
    poolMax: parseInt(process.env['DB_POOL_MAX'] || '10', 10),
  },

  // Redis
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'],
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
  },

  // File Storage
  storage: {
    inputDir: process.env['INPUT_DIR'] || './images',
    outputDir: process.env['OUTPUT_DIR'] || './output',
    tempDir: process.env['TEMP_DIR'] || './temp',
    credentialsDir: process.env['CREDENTIALS_DIR'] || './credentials',
    uploadMaxSize: parseInt(process.env['UPLOAD_MAX_SIZE'] || '10485760', 10), // 10MB
  },

  // Security
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'change-this-secret',
    jwtExpiration: process.env['JWT_EXPIRATION'] || '24h',
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '10', 10),
    encryptionKey: process.env['ENCRYPTION_KEY'] || '',
  },

  // HIPAA Compliance
  hipaa: {
    auditLoggingEnabled: process.env['AUDIT_LOGGING_ENABLED'] === 'true',
    dataRetentionDays: parseInt(process.env['DATA_RETENTION_DAYS'] || '2190', 10),
    phiEncryptionEnabled: process.env['PHI_ENCRYPTION_ENABLED'] === 'true',
    baaValidationEnabled: process.env['BAA_VALIDATION_ENABLED'] === 'true',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },

  // OCR Settings
  ocr: {
    confidenceThreshold: parseFloat(process.env['OCR_CONFIDENCE_THRESHOLD'] || '0.80'),
    enhanceImages: process.env['OCR_ENHANCE_IMAGES'] === 'true',
    detectHandwriting: process.env['OCR_DETECT_HANDWRITING'] === 'true',
    languages: (process.env['OCR_LANGUAGES'] || 'en,ar').split(','),
  },

  // AI Processing
  ai: {
    retryAttempts: parseInt(process.env['AI_RETRY_ATTEMPTS'] || '3', 10),
    retryDelayMs: parseInt(process.env['AI_RETRY_DELAY_MS'] || '1000', 10),
    timeoutMs: parseInt(process.env['AI_TIMEOUT_MS'] || '30000', 10),
  },

  // Presentation
  presentation: {
    fontFamily: process.env['PPTX_FONT_FAMILY'] || 'Courier New',
    fontSize: parseInt(process.env['PPTX_FONT_SIZE'] || '12', 10),
    templatePath: process.env['PPTX_TEMPLATE_PATH'] || './templates/default.pptx',
  },

  // FHIR
  fhir: {
    version: process.env['FHIR_VERSION'] || 'R4',
    baseUrl: process.env['FHIR_BASE_URL'] || 'http://localhost:8080/fhir',
    validateResources: process.env['FHIR_VALIDATE_RESOURCES'] === 'true',
    oidBase: process.env['FHIR_OID_BASE'] || '1.3.6.1.4.1.61026',
  },

  // Translation
  translation: {
    enabled: process.env['TRANSLATION_ENABLED'] === 'true',
    cacheEnabled: process.env['TRANSLATION_CACHE_ENABLED'] === 'true',
    defaultSourceLanguage: process.env['DEFAULT_SOURCE_LANGUAGE'] || 'en',
    defaultTargetLanguage: process.env['DEFAULT_TARGET_LANGUAGE'] || 'ar',
  },
};
