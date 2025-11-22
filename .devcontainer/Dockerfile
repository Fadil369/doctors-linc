FROM node:18-bullseye

# Install system dependencies for medical/healthcare processing
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    # Build tools
    build-essential \
    git \
    curl \
    wget \
    ca-certificates \
    # Python for ML/AI tasks
    python3 \
    python3-pip \
    python3-dev \
    # Image processing libraries (for OCR preprocessing)
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libwebp-dev \
    libopencv-dev \
    imagemagick \
    # PDF processing
    poppler-utils \
    ghostscript \
    # Database clients
    postgresql-client \
    redis-tools \
    # Text processing
    hunspell \
    aspell \
    # Security tools
    gnupg \
    # Utilities
    vim \
    nano \
    less \
    jq \
    tree \
    htop \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for AI/ML
RUN pip3 install --no-cache-dir \
    # Image preprocessing
    opencv-python \
    pillow \
    numpy \
    scipy \
    scikit-image \
    # OCR tools
    pytesseract \
    # ML frameworks (for future enhancements)
    tensorflow \
    torch \
    transformers \
    # Medical NLP
    scispacy \
    medspacy \
    # FHIR libraries
    fhir.resources \
    fhirclient \
    # Utilities
    python-dotenv \
    pyyaml \
    requests

# Install global Node.js tools
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    pm2 \
    npm-check-updates \
    eslint \
    prettier \
    jest \
    @nestjs/cli \
    # API development
    swagger-cli \
    # Security scanning
    snyk \
    # Documentation
    typedoc

# Install Google Cloud SDK (for Vision API)
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
    tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && \
    apt-get update && \
    apt-get install -y google-cloud-sdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure ImageMagick to allow PDF processing
RUN sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<policy domain="coder" rights="read|write" pattern="PDF" \/>/g' /etc/ImageMagick-6/policy.xml

# Set working directory
WORKDIR /workspace

# Create necessary directories
RUN mkdir -p /workspace/images /workspace/output /workspace/credentials /workspace/logs

# Set up non-root user
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Configure bash prompt and aliases
RUN echo 'export PS1="\[\e[36m\]🏥 doctors-linc\[\e[m\] \[\e[33m\]\w\[\e[m\] \[\e[32m\]\\$\[\e[m\] "' >> /home/$USERNAME/.bashrc && \
    echo 'alias ll="ls -lah"' >> /home/$USERNAME/.bashrc && \
    echo 'alias gs="git status"' >> /home/$USERNAME/.bashrc && \
    echo 'alias gd="git diff"' >> /home/$USERNAME/.bashrc && \
    echo 'alias npm-dev="npm run dev"' >> /home/$USERNAME/.bashrc

# Switch to non-root user
USER $USERNAME

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1
