#!/usr/bin/env python3
"""
Start script for Avenai AI Platform
This file can be run directly by Railway without needing bash
"""

import os
import subprocess
import sys

def main():
    print("🚀 Starting Avenai AI Platform via start.py...")
    print(f"Current directory: {os.getcwd()}")
    print(f"Python version: {sys.version}")
    print(f"Port: {os.environ.get('PORT', '8000')}")
    
    # List files in current directory
    print("Files in current directory:")
    try:
        for file in os.listdir('.'):
            print(f"  {file}")
    except Exception as e:
        print(f"Error listing files: {e}")
    
    # Check if avenai_final.py exists
    if os.path.exists('avenai_final.py'):
        print("✅ avenai_final.py found!")
    else:
        print("❌ avenai_final.py NOT found!")
        print("Available Python files:")
        for file in os.listdir('.'):
            if file.endswith('.py'):
                print(f"  {file}")
    
    # Get the port from environment variable
    port = os.environ.get('PORT', '8000')
    
    # Start uvicorn
    cmd = [
        sys.executable, "-m", "uvicorn",
        "avenai_final:app",
        "--host", "0.0.0.0",
        "--port", port
    ]
    
    print(f"Starting command: {' '.join(cmd)}")
    
    # Execute the command
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting uvicorn: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("Shutting down...")
        sys.exit(0)

if __name__ == "__main__":
    main()
