# 🚀 Avenai Deployment Guide

This guide covers deploying Avenai to production using Docker, Docker Compose, and best practices.

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- At least 4GB RAM and 20GB disk space
- Domain name (optional but recommended)
- SSL certificates (for production)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80/443)│    │   Frontend      │    │   Backend       │
│   (Load Balancer)│◄──►│   (Next.js)     │◄──►│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │   Redis         │
                       │   (Database)    │    │   (Cache)       │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Prometheus    │    │   Grafana       │
                       │   (Metrics)     │    │   (Dashboard)   │
                       └─────────────────┘    └─────────────────┘
```

## 🐳 Quick Start (Development)

### 1. Clone and Setup

```bash
git clone <your-repo>
cd avenai
cp config/production.env .env.development
# Edit .env.development with your settings
```

### 2. Start Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### 3. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Copy production config
cp config/production.env .env.production

# Edit with your production values
nano .env.production
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://:password@host:6379/0

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Security
SECRET_KEY=your_super_secret_key
ALLOWED_ORIGINS=https://yourdomain.com

# SSL (if using HTTPS)
SSL_ENABLED=True
SSL_CERT_PATH=/path/to/cert.crt
SSL_KEY_PATH=/path/to/key.key
```

### 2. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp your_cert.crt nginx/ssl/avenai.crt
cp your_key.key nginx/ssl/avenai.key

# Set proper permissions
chmod 600 nginx/ssl/*
```

### 3. Deploy

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production

# Or with clean build
./scripts/deploy.sh production --clean
```

### 4. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Health checks
curl http://localhost:8000/health
curl http://localhost:3000/
```

## 🔧 Configuration

### Nginx Configuration

The Nginx configuration includes:
- SSL/TLS termination
- Load balancing
- Rate limiting
- Security headers
- Gzip compression
- Static file caching

**Customize**: Edit `nginx/nginx.conf` for your domain and requirements.

### Database Configuration

PostgreSQL is configured with:
- Connection pooling
- Performance tuning
- Backup scheduling
- Health monitoring

**Customize**: Edit `database/init/01_init.sql` for schema changes.

### Monitoring Setup

Prometheus and Grafana provide:
- Application metrics
- System monitoring
- Custom dashboards
- Alerting rules

**Access**:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## 📊 Monitoring and Logs

### Application Logs

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Database Logs

```bash
# PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Redis logs
docker-compose -f docker-compose.prod.yml logs -f redis
```

### Metrics and Health

- **Health Check**: `/health`
- **Metrics**: `/metrics` (Prometheus format)
- **Real-time Monitoring**: `/monitoring/real-time`

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env.production` to version control
- Use strong, unique passwords
- Rotate API keys regularly

### 2. Network Security
- Use firewalls to restrict access
- Enable rate limiting
- Monitor for suspicious activity

### 3. SSL/TLS
- Use strong cipher suites
- Enable HSTS headers
- Regular certificate renewal

### 4. Database Security
- Use strong passwords
- Limit network access
- Regular security updates

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend services
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Load Balancer Configuration

Update `nginx/nginx.conf` to include multiple backend instances:

```nginx
upstream backend {
    least_conn;
    server backend:8000 max_fails=3 fail_timeout=30s;
    server backend:8001 max_fails=3 fail_timeout=30s;
    server backend:8002 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

## 🗄️ Database Management

### Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres \
    pg_dump -U avenai_user avenai_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U avenai_user -d avenai_prod < backup_file.sql
```

### Migrations

```bash
# Run migrations (if using Alembic)
docker-compose -f docker-compose.prod.yml exec backend \
    alembic upgrade head
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the port
   lsof -i :8000
   # Kill process or change port in docker-compose
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready
   # Check logs
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. **Memory Issues**
   ```bash
   # Check resource usage
   docker stats
   # Increase memory limits in docker-compose
   ```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
docker-compose -f docker-compose.prod.yml up -d

# View detailed logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔄 Updates and Maintenance

### 1. Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Update Dependencies

```bash
# Update Python packages
docker-compose -f docker-compose.prod.yml exec backend pip install -r requirements.prod.txt --upgrade

# Update Node packages
docker-compose -f docker-compose.prod.yml exec frontend npm update
```

### 3. System Updates

```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f [service]`
2. Verify configuration files
3. Check environment variables
4. Review this documentation

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)
