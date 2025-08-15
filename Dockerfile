FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make build script executable and verify it exists
RUN chmod +x build.sh && \
    ls -la build.sh && \
    echo "Files in /app:" && \
    ls -la

# Expose port
EXPOSE 8000

# Use the start script
CMD ["bash", "start.sh"]
