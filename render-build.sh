#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo "==> MTI Knowledge Assistant - Render Build"
echo "=========================================="

echo "==> Upgrading pip and wheel tools..."
python -m pip install --upgrade pip setuptools wheel

echo "==> Installing lightweight CPU-only PyTorch for optimal memory usage..."
python -m pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

echo "==> Installing Python project dependencies..."
python -m pip install --no-cache-dir -r requirements.txt

echo "==> Pre-caching sentence-transformers embedding model to eliminate runtime query latency..."
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')" || true

echo "==> Build finished successfully."
