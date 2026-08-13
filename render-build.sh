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

echo "==> Build finished successfully."
