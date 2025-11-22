# 🚀 Quick Start Guide

This guide will help you get started with Doctors-Linc in under 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- Visual Studio Code installed
- Git installed

## Step 1: Clone and Open in DevContainer

```bash
# Clone the repository
git clone https://github.com/Fadil369/doctors-linc.git
cd doctors-linc

# Open in VS Code
code .
```

When VS Code opens, you'll see a prompt to "Reopen in Container". Click it!

**First-time setup takes 5-10 minutes** as Docker builds the container and installs all dependencies.

## Step 2: Set Up API Keys

Once the container is running:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```bash
   code .env
   ```

3. **Required API Keys:**
   - `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
   - `GOOGLE_APPLICATION_CREDENTIALS` - Download service account JSON from Google Cloud Console

4. For Google Cloud:
   ```bash
   # Place your service account JSON in credentials/
   # The file path should be: ./credentials/gcp-key.json
   ```

## Step 3: Test Your Setup

```bash
# Check health of all agents
npm run cli health

# Should show:
# ✅ MASTERLINC: healthy
# ✅ OCRLINC: operational
# ✅ HEALTHCARELINC: operational
```

## Step 4: Process Your First Medical Image

```bash
# Place a medical image in the images/ folder
cp ~/Downloads/prescription.jpg ./images/

# Process it through the full pipeline
npm run cli process ./images/prescription.jpg

# Output will be saved to ./output/
```

## Step 5: Start the API Server

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
# Health check: http://localhost:3000/health
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm test                 # Run tests
npm run lint             # Check code quality

# OCR Processing
npm run cli ocr ./images/test.jpg          # Extract text
npm run cli process ./images/test.jpg       # Full pipeline

# Database
db-connect              # Connect to PostgreSQL
db-reset                # Reset database schema

# Docker
docker-compose ps       # Check running services
docker-compose logs app # View application logs
```

## Troubleshooting

### "Docker daemon not running"
- **Windows/Mac**: Start Docker Desktop
- **Linux**: `sudo systemctl start docker`

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### "Database connection failed"
```bash
# Restart PostgreSQL
docker-compose restart db

# Reset database
db-reset
```

### "API keys not working"
```bash
# Verify .env file exists
ls -la .env

# Check environment variables are loaded
show-env
```

## Next Steps

- 📖 Read [DEVCONTAINER.md](./DEVCONTAINER.md) for detailed documentation
- 🏥 Review [AGENTS.md](./AGENTS.md) to understand the AI agents
- 💡 Check [SKILLS.md](./SKILLS.md) for available skills
- 📋 See [PRD.md](./PRD.md) for product roadmap

## Getting Help

- Check logs: `tail -f logs/doctors-linc-*.log`
- View container logs: `docker-compose logs app`
- Rebuild container: In VS Code, press `F1` → "Remote-Containers: Rebuild Container"

**Happy coding! 🎉**
