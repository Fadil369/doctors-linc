# 🏥 Doctors-Linc - Development Container Setup

> **NEW!** This repository now includes a complete development container with all tools pre-configured! 🎉

## 🚀 Quick Start with DevContainer

The fastest way to start developing Doctors-Linc is using the included development container:

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac) or Docker Engine (Linux)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Get Started in 3 Steps

```bash
# 1. Clone the repository
git clone https://github.com/Fadil369/doctors-linc.git
cd doctors-linc

# 2. Open in VS Code
code .

# 3. When prompted, click "Reopen in Container"
# That's it! The container will build automatically (first time takes 5-10 minutes)
```

### What's Included in the DevContainer?

✅ **Complete Development Environment:**
- Node.js 18 + TypeScript + Python 3.11
- Google Cloud SDK (for Vision API)
- PostgreSQL 15 + Redis 7
- All dependencies pre-installed
- Medical/Healthcare libraries (FHIR, ScispaCy, MedspaCy)
- Image processing tools (OpenCV, Sharp, ImageMagick)

✅ **20+ Pre-configured VS Code Extensions:**
- ESLint + Prettier
- TypeScript language support
- Jest test runner
- Docker support
- Database tools (SQLTools)
- FHIR tools
- Security scanning (Snyk)

✅ **Ready-to-Use Services:**
- PostgreSQL database with HIPAA-compliant schema
- Redis for caching
- pgAdmin (optional) for database management

### First-Time Setup

Once the devcontainer is running:

1. **Set up API keys:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

2. **Verify setup:**
   ```bash
   npm run cli health
   ```

3. **Run example:**
   ```bash
   npm run example
   ```

### Quick Commands

```bash
# Development
npm run dev              # Start API server
npm test                 # Run tests
npm run cli health       # Check system status

# Process medical documents
npm run cli ocr ./images/prescription.jpg
npm run cli process ./images/prescription.jpg

# Database
db-connect              # Connect to PostgreSQL
db-reset                # Reset database
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick start guide
- **[DEVCONTAINER.md](./DEVCONTAINER.md)** - Complete devcontainer documentation
- **[AGENTS.md](./AGENTS.md)** - AI agent configuration
- **[SKILLS.md](./SKILLS.md)** - Core skills documentation
- **[PRD.md](./PRD.md)** - Product requirements

---

## Architecture Overview

The devcontainer includes a complete multi-agent AI system:

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCTORS-LINC AGENTS                      │
└─────────────────────────────────────────────────────────────┘

MASTERLINC (Orchestrator)
    ├── OCRLINC (Document Processing)
    │   └── Google Cloud Vision API
    ├── HEALTHCARELINC (Medical Intelligence)  
    │   └── OpenAI GPT-4 + LangChain
    ├── TTLINC (Translation)
    │   └── Bilingual Support (Arabic/English)
    ├── COMPLIANCELINC (HIPAA Compliance)
    │   └── Audit Logging + Encryption
    └── CLINICALLINC (Decision Support)
        └── Drug Interactions + Alerts
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js 18, TypeScript, Express.js |
| **AI/ML** | OpenAI GPT-4, LangChain, TensorFlow, PyTorch |
| **OCR** | Google Cloud Vision API |
| **Medical** | FHIR R4, ScispaCy, MedspaCy |
| **Database** | PostgreSQL 15, Redis 7 |
| **Image Processing** | OpenCV, Sharp, ImageMagick |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, GitHub Actions |

## Features Implemented

- [x] **Complete DevContainer Setup**
  - Multi-service Docker Compose (PostgreSQL, Redis)
  - Auto-configured VS Code with 20+ extensions
  - Python + Node.js environment
  - Healthcare libraries pre-installed

- [x] **Core Infrastructure**
  - TypeScript configuration
  - ESLint + Prettier
  - Jest testing framework
  - Winston logging
  - Express API server
  - Database services (PostgreSQL, Redis)

- [x] **AI Agents**
  - MASTERLINC orchestrator
  - OCRLINC for document processing
  - HEALTHCARELINC for medical text structuring

- [x] **CLI Tool**
  - `doctors-linc ocr` - Extract text from images
  - `doctors-linc process` - Full pipeline processing
  - `doctors-linc health` - System health check

- [x] **CI/CD Pipeline**
  - GitHub Actions workflow
  - Automated testing
  - Docker image building
  - Security scanning

## Roadmap

### Phase 1: Core Pipeline (In Progress)
- [x] DevContainer setup
- [x] Basic OCR integration
- [x] AI text structuring
- [ ] PowerPoint generation
- [ ] FHIR resource creation

### Phase 2: Enhanced Features
- [ ] Batch processing
- [ ] Web interface
- [ ] Advanced FHIR support
- [ ] Clinical decision support
- [ ] Translation (Arabic/English)

### Phase 3: Production Ready
- [ ] HIPAA compliance audit
- [ ] Performance optimization
- [ ] Monitoring and alerts
- [ ] Cloud deployment
- [ ] User documentation

## Contributing

We welcome contributions! The devcontainer makes it easy to start contributing:

1. Fork the repository
2. Open in devcontainer
3. Create a feature branch
4. Make your changes
5. Run tests: `npm test`
6. Submit a pull request

## Security & Compliance

⚠️ **IMPORTANT**: If processing real patient data, this system **MUST** comply with HIPAA regulations.

The devcontainer includes:
- ✅ Audit logging (HIPAA-compliant)
- ✅ Encryption support (AES-256)
- ✅ Access controls
- ✅ Secure credential management

See [PRD.md](./PRD.md) for complete HIPAA compliance checklist.

## License

MIT License - See [LICENSE](./LICENSE) for details

## Support

- **Documentation**: See [DEVCONTAINER.md](./DEVCONTAINER.md)
- **Issues**: [GitHub Issues](https://github.com/Fadil369/doctors-linc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Fadil369/doctors-linc/discussions)

---

**Made with ❤️ for healthcare professionals**

