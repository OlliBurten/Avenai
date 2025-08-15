#!/bin/bash
echo "Starting Avenai AI Platform..."
echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"
echo "Python path: $(which python3)"
echo "Uvicorn path: $(python3 -m uvicorn --version)"
echo "Port: $PORT"
echo "Starting uvicorn..."

# Try to start the app
exec python3 -m uvicorn avenai_final:app --host 0.0.0.0 --port $PORT --workers 1
