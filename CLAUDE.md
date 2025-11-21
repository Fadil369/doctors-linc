# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Doctors-Linc is an early-stage OCR pipeline project for healthcare document processing. The project aims to:

1. Extract text from medical images using Google Cloud Vision OCR
2. Structure extracted text into Markdown using LangChain + OpenAI
3. Generate PowerPoint presentations from the processed content

**Current Status**: Conceptual sketch only - no working implementation yet.

## Architecture

```
Input Images (PNG/JPG)
    ↓
Google Vision OCR → Raw Text
    ↓
LangChain/OpenAI → Structured Markdown
    ↓
PptxGenJS → Individual .md files + presentation.pptx
```

## Development Setup

### Prerequisites
- Node.js
- Google Cloud Vision API credentials
- OpenAI API key

### Environment Variables
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
OPENAI_API_KEY=your-api-key
```

### Dependencies (to be installed)
```bash
npm install @google-cloud/vision langchain pptxgenjs
```

## Build Commands

No build system configured yet. When implemented:

```bash
# Install dependencies
npm install

# Run the pipeline
node index.js

# Expected directory structure
./images/          # Input images
./output/          # Generated .md files and .pptx
```

## Key Implementation Details

- **OCR**: Uses `documentTextDetection()` for full-document scanning
- **Summarization**: LangChain PromptTemplate converts raw OCR to structured Markdown with headings, lists, and code blocks
- **Presentation**: PptxGenJS generates slides with Courier New font for markdown display
- **Templates**: Support for PowerPoint slide masters with `{{content}}` placeholder and Keynote AppleScript automation

## Healthcare Compliance Note

If handling real patient data, implementation must address HIPAA compliance including data encryption, access controls, and audit logging.
