#!/bin/bash
echo "Starting Avenai AI Platform..."
python3 -m uvicorn avenai_final:app --host 0.0.0.0 --port $PORT
