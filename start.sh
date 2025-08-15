#!/bin/bash
set -e

echo "🚀 Starting Avenai AI Platform via start.sh..."
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

echo "Python version: $(python3 --version)"
echo "Port: $PORT"
echo "Starting uvicorn..."

# Try to start the app
python3 -m uvicorn avenai_final:app --host 0.0.0.0 --port $PORT
