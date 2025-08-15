#!/usr/bin/env python3
import os
import subprocess
import sys

# Get the port from environment variable
port = os.environ.get('PORT', '8000')

# Start uvicorn
cmd = [
    sys.executable, "-m", "uvicorn",
    "avenai_final:app",
    "--host", "0.0.0.0",
    "--port", port
]

# Execute the command
subprocess.run(cmd, check=True)
