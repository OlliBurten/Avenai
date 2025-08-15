#!/bin/bash
echo "Starting Avenai AI Platform..."
echo "Port: $PORT"
echo "Starting uvicorn..."

exec python3 -m uvicorn avenai_final:app --host 0.0.0.0 --port $PORT
