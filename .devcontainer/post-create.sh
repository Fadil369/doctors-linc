#!/bin/bash

# Post-create script for devcontainer setup
set -e

echo "🏥 Setting up Doctors-Linc development environment..."

# Change to workspace directory
cd /workspaces/doctors-linc || cd /workspace

# Install npm dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "⚠️  No package.json found, skipping npm install"
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "🐍 Installing Python dependencies..."
    pip3 install --user -r requirements.txt
fi

# Set up git hooks if .git exists
if [ -d ".git" ]; then
    echo "🔧 Setting up git hooks..."
    if [ -f "package.json" ]; then
        npx husky install 2>/dev/null || echo "Husky not installed yet"
    fi
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p images output credentials logs temp tests/fixtures

# Set up environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your API keys."
fi

# Display helpful information
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📚 Quick Start Commands:"
echo "  npm run dev       - Start development server"
echo "  npm test          - Run tests"
echo "  npm run lint      - Lint code"
echo "  npm run format    - Format code with Prettier"
echo ""
echo "🔗 Services:"
echo "  PostgreSQL: localhost:5432 (user: postgres, pass: postgres)"
echo "  Redis: localhost:6379"
echo "  API Server: localhost:3000 (when running)"
echo ""
echo "📖 Documentation:"
echo "  README.md         - Project overview"
echo "  AGENTS.md         - AI Agent configuration"
echo "  PRD.md            - Product requirements"
echo "  SKILLS.md         - Core skills documentation"
echo ""
echo "🔐 Security Reminders:"
echo "  - Never commit .env files with real credentials"
echo "  - Use .env.example for templates"
echo "  - Keep credentials/ directory in .gitignore"
echo ""
echo "Happy coding! 🚀"
