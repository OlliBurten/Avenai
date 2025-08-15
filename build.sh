#!/bin/bash
set -e

echo "🔨 Starting build process..."
echo "Python version: $(python3 --version)"
echo "Pip version: $(python3 -m pip --version)"

echo "📦 Installing dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install --no-cache-dir -r requirements.txt

echo "✅ Verifying uvicorn installation..."
python3 -m uvicorn --version

echo "🚀 Build completed successfully!"
