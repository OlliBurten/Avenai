#!/bin/bash
# Railway start script for Avenai AI Platform
echo "🚀 Starting Avenai AI Platform via start.sh..."
echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"
echo "Port: $PORT"
echo "Starting uvicorn..."

exec python3 -m uvicorn avenai_final:app --host 0.0.0.0 --port $PORT
