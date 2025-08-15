#!/bin/bash

# Avenai Production Deployment Script
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🚀 Starting Avenai deployment for ${ENVIRONMENT}...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install it and try again.${NC}"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${YELLOW}📋 Loading environment variables from .env.${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  No .env.${ENVIRONMENT} file found. Using default values.${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs uploads database/init nginx/ssl monitoring/grafana/provisioning

# Set proper permissions
echo -e "${YELLOW}🔐 Setting proper permissions...${NC}"
chmod 755 logs uploads
chmod 600 nginx/ssl/* 2>/dev/null || true

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.${ENVIRONMENT}.yml down --remove-orphans

# Remove old images (optional)
if [ "$2" = "--clean" ]; then
    echo -e "${YELLOW}🧹 Cleaning old images...${NC}"
    docker system prune -f
fi

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d --build

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🏥 Checking service health...${NC}"
for service in postgres redis backend frontend nginx; do
    if docker-compose -f docker-compose.${ENVIRONMENT}.yml ps $service | grep -q "Up"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
        exit 1
    fi
done

# Run database migrations (if needed)
echo -e "${YELLOW}🗄️  Checking database status...${NC}"
if docker-compose -f docker-compose.${ENVIRONMENT}.yml exec -T postgres pg_isready -U avenai_user -d avenai_prod; then
    echo -e "${GREEN}✅ Database is ready${NC}"
else
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 10
fi

# Check API health
echo -e "${YELLOW}🔍 Checking API health...${NC}"
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

# Check frontend health
echo -e "${YELLOW}🔍 Checking frontend health...${NC}"
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    exit 1
fi

# Show service status
echo -e "${YELLOW}📊 Service status:${NC}"
docker-compose -f docker-compose.${ENVIRONMENT}.yml ps

# Show logs
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose -f docker-compose.${ENVIRONMENT}.yml logs --tail=20

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}🔌 Backend API: http://localhost:8000${NC}"
echo -e "${GREEN}📊 Grafana: http://localhost:3001${NC}"
echo -e "${GREEN}📈 Prometheus: http://localhost:9090${NC}"
echo -e "${GREEN}🗄️  Database: localhost:5432${NC}"
echo -e "${GREEN}🔴 Redis: localhost:6379${NC}"

# Optional: Open browser
if command -v open &> /dev/null; then
    read -p "Open frontend in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000
    fi
fi
