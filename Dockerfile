# ==============================================================================
# MTI Knowledge Assistant - Hugging Face Space Dockerfile (FastAPI + RAG)
# ==============================================================================

FROM python:3.11-slim

# Set environment variables for performance and single-core efficiency
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    TOKENIZERS_PARALLELISM=false \
    PORT=8000

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (UID 1000) for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user
WORKDIR /app

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Install CPU-optimized PyTorch first, followed by requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source directories
COPY backend/ /app/backend/
COPY rag/ /app/rag/
COPY data/ /app/data/
COPY README.md /app/

# Set up storage directories and adjust permissions for non-root user
RUN mkdir -p /app/data /app/rag/store /app/data/extracted_images && \
    chown -R user:user /app

# Switch to user 1000
USER user

# Expose application port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch FastAPI ASGI server dynamically binding to Railway $PORT
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
