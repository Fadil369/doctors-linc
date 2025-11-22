# 🏥 Doctors-Linc Development Container Guide

This guide explains how to use the development container for Doctors-Linc, providing a complete, consistent development environment with all necessary tools pre-configured.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Container Features](#container-features)
4. [Development Workflow](#development-workflow)
5. [Available Commands](#available-commands)
6. [Database Access](#database-access)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before using the devcontainer, ensure you have:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Minimum: 4GB RAM allocated to Docker
  - Recommended: 8GB RAM for optimal performance

- **Visual Studio Code**
  - [Download VS Code](https://code.visualstudio.com/)

- **VS Code Extensions**
  - [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Fadil369/doctors-linc.git
cd doctors-linc
```

### 2. Open in Container

**Option A: Using VS Code Command Palette**
1. Open VS Code
2. Press `F1` or `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac)
3. Type: `Remote-Containers: Reopen in Container`
4. Wait for container to build (first time takes 5-10 minutes)

**Option B: Using VS Code Prompt**
1. Open the folder in VS Code
2. Click "Reopen in Container" when prompted

**Option C: Using CLI**
```bash
code .
# Then follow Option A
```

### 3. Wait for Post-Create Setup

The devcontainer will automatically:
- Install npm dependencies
- Create necessary directories
- Initialize databases
- Set up git hooks
- Display welcome message

---

## Container Features

### 🛠️ Installed Tools

#### Languages & Runtimes
- **Node.js 18** - JavaScript/TypeScript runtime
- **Python 3.11** - For ML/AI tasks and image processing
- **TypeScript** - Type-safe JavaScript

#### AI & ML Tools
- **OpenAI SDK** - GPT integration
- **LangChain** - LLM orchestration
- **TensorFlow** - Machine learning (optional)
- **PyTorch** - Deep learning (optional)

#### Medical/Healthcare Tools
- **Google Cloud Vision API** - OCR processing
- **FHIR Libraries** - Healthcare data standards
- **ScispaCy/MedspaCy** - Medical NLP

#### Image Processing
- **OpenCV** - Computer vision
- **Pillow** - Image manipulation
- **ImageMagick** - Image processing
- **Sharp** - High-performance image processing

#### Databases
- **PostgreSQL 15** - Primary database (runs on port 5432)
- **Redis 7** - Caching and queues (runs on port 6379)
- **pgAdmin 4** - Database management UI (port 5050, optional)

#### Development Tools
- **Git & GitHub CLI** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Nodemon** - Auto-reload for development
- **TypeDoc** - Documentation generation
- **Snyk** - Security scanning

### 📦 Pre-configured VS Code Extensions

The devcontainer automatically installs:
- TypeScript & JavaScript language support
- ESLint & Prettier
- Jest test runner
- Docker support
- GitLens
- REST Client
- PostgreSQL tools
- FHIR tools
- Security scanning (Snyk)

### 🔌 Port Forwarding

Automatically forwarded ports:
- **3000** - API Server
- **5432** - PostgreSQL
- **6379** - Redis
- **5050** - pgAdmin (when using `tools` profile)
- **9229** - Node.js debugger

---

## Development Workflow

### Starting Development

1. **Open Integrated Terminal** (`Ctrl+` ` or `View > Terminal`)

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the API**
   - Open browser: http://localhost:3000/health
   - Use REST Client extension to test API endpoints

### Project Structure

```
doctors-linc/
├── .devcontainer/          # Devcontainer configuration
│   ├── devcontainer.json   # Main config
│   ├── Dockerfile          # Container image
│   ├── docker-compose.yml  # Services
│   ├── post-create.sh      # Setup script
│   └── init-db.sql         # Database schema
├── src/                    # Source code
│   ├── agents/             # AI agents (MASTERLINC, HEALTHCARELINC, etc.)
│   ├── skills/             # Reusable skills
│   ├── services/           # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── tests/                  # Test files
├── images/                 # Input medical images
├── output/                 # Generated outputs
├── logs/                   # Application logs
└── credentials/            # API credentials (gitignored)
```

---

## Available Commands

### NPM Scripts

```bash
# Development
npm run dev              # Start dev server with auto-reload
npm run dev:check        # Verify environment setup

# Building
npm run build            # Compile TypeScript to JavaScript
npm run clean            # Remove build artifacts

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ocr         # Run only OCR tests
npm run test:ai          # Run only AI tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Docker
npm run docker:build     # Build production Docker image
npm run docker:run       # Run with docker-compose
npm run docker:stop      # Stop docker-compose services

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data

# Processing
npm run ocr:process      # Process image with OCR
npm run pipeline:run     # Run full pipeline

# Documentation
npm run docs:generate    # Generate TypeDoc documentation

# Security
npm run security:check   # Run security audit
```

### Custom Terminal Commands

The devcontainer includes helpful aliases:

```bash
# Git shortcuts
gs                       # git status
gd                       # git diff
gl                       # git log --oneline --graph

# Docker shortcuts
dc                       # docker-compose

# Database
db-connect               # Connect to PostgreSQL
db-reset                 # Reset database schema

# Utilities
ll                       # ls -lah (detailed file list)
show-env                 # Show environment variables
ocr-test <image>         # Test OCR on specific image
```

---

## Database Access

### PostgreSQL

**From Terminal:**
```bash
# Using alias
db-connect

# Or full command
psql postgresql://postgres:postgres@localhost:5432/doctors_linc
```

**Common Queries:**
```sql
-- List tables
\dt doctors_linc.*

-- View audit logs
SELECT * FROM doctors_linc.audit_logs ORDER BY timestamp DESC LIMIT 10;

-- View processed documents
SELECT id, filename, document_type, status, ocr_confidence 
FROM doctors_linc.documents 
ORDER BY created_at DESC;

-- Check FHIR resources
SELECT resource_type, COUNT(*) 
FROM doctors_linc.fhir_resources 
GROUP BY resource_type;
```

### Redis

**From Terminal:**
```bash
# Connect to Redis
redis-cli

# Check keys
KEYS *

# Get value
GET key_name

# Monitor commands
MONITOR
```

### pgAdmin (Optional)

Start pgAdmin:
```bash
docker-compose --profile tools up pgadmin -d
```

Access: http://localhost:5050
- Email: admin@doctors-linc.local
- Password: admin

---

## Environment Configuration

### Setting Up API Keys

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**
   ```bash
   # Use VS Code
   code .env

   # Or use nano
   nano .env
   ```

3. **Add your API keys:**
   ```env
   # Google Cloud Vision
   GOOGLE_APPLICATION_CREDENTIALS=./credentials/gcp-key.json

   # OpenAI
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

4. **Add Google Cloud credentials:**
   - Download service account JSON from Google Cloud Console
   - Save as `./credentials/gcp-key.json`

### Verifying Configuration

```bash
# Check environment variables
show-env

# Test API connections
npm run dev
```

---

## Troubleshooting

### Container Won't Start

**Problem:** Docker daemon not running
```bash
# Windows/Mac: Start Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker
```

**Problem:** Port already in use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Database Connection Issues

**Problem:** PostgreSQL not ready
```bash
# Check PostgreSQL status
docker-compose ps

# Restart PostgreSQL
docker-compose restart db

# Reset database
db-reset
```

### NPM Install Fails

**Problem:** Network or dependency issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Problem:** Type errors after updating dependencies
```bash
# Rebuild TypeScript
npm run clean
npm run build

# Check types without building
npm run type-check
```

### Slow Performance

**Increase Docker Resources:**
1. Open Docker Desktop Settings
2. Go to Resources
3. Increase RAM to 8GB
4. Increase CPU cores to 4
5. Click "Apply & Restart"

---

## Tips & Best Practices

### 1. Use Git Hooks
The devcontainer automatically sets up Husky git hooks:
- Pre-commit: Runs ESLint and Prettier
- Pre-push: Runs tests

### 2. Enable Auto-Save
In VS Code:
- File > Auto Save (or `Ctrl+,` > search "auto save")

### 3. Use Debugging
- Set breakpoints in VS Code
- Press `F5` to start debugging
- Debugger runs on port 9229

### 4. Monitor Logs
```bash
# View application logs
tail -f logs/doctors-linc-$(date +%Y-%m-%d).log

# View error logs
tail -f logs/errors-$(date +%Y-%m-%d).log

# View audit logs (HIPAA)
tail -f logs/audit-$(date +%Y-%m-%d).log
```

### 5. Test with Sample Data
```bash
# Place test images in ./images/
cp ~/Downloads/prescription.jpg ./images/

# Run OCR test
ocr-test ./images/prescription.jpg
```

---

## Additional Resources

- **Project Documentation:**
  - [README.md](../README.md) - Project overview
  - [AGENTS.md](../AGENTS.md) - AI agent configuration
  - [SKILLS.md](../SKILLS.md) - Core skills documentation
  - [PRD.md](../PRD.md) - Product requirements

- **External Documentation:**
  - [Google Cloud Vision API](https://cloud.google.com/vision/docs)
  - [OpenAI API](https://platform.openai.com/docs)
  - [LangChain](https://js.langchain.com/docs)
  - [FHIR R4](https://hl7.org/fhir/R4/)

- **VS Code Devcontainers:**
  - [Official Documentation](https://code.visualstudio.com/docs/remote/containers)
  - [devcontainer.json reference](https://containers.dev/implementors/json_reference/)

---

## Getting Help

If you encounter issues:

1. **Check logs:**
   ```bash
   docker-compose logs app
   ```

2. **Rebuild container:**
   ```bash
   # In VS Code Command Palette
   Remote-Containers: Rebuild Container
   ```

3. **Reset everything:**
   ```bash
   docker-compose down -v
   rm -rf node_modules
   # Then reopen in container
   ```

4. **Report issues:**
   - Create a GitHub issue with error logs
   - Include system info (OS, Docker version, VS Code version)

---

**Happy Coding! 🚀**
