#!/bin/bash

# Avenai Production Backup Script
# Usage: ./backup.sh [backup_type] [retention_days]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${2:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE=${1:-full}

# Database configuration
DB_NAME="avenai_prod"
DB_USER="avenai_user"
DB_HOST="localhost"
DB_PORT="5432"

# Redis configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Uploads directory
UPLOADS_DIR="/app/uploads"

echo -e "${GREEN}🚀 Starting Avenai backup process...${NC}"
echo -e "${YELLOW}📅 Timestamp: ${TIMESTAMP}${NC}"
echo -e "${YELLOW}📦 Backup Type: ${BACKUP_TYPE}${NC}"
echo -e "${YELLOW}🗂️  Backup Directory: ${BACKUP_DIR}${NC}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Function to check if PostgreSQL is running
check_postgres() {
    if ! pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" > /dev/null 2>&1; then
        echo -e "${RED}❌ PostgreSQL is not running or accessible${NC}"
        exit 1
    fi
}

# Function to check if Redis is running
check_redis() {
    if ! redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" ping > /dev/null 2>&1; then
        echo -e "${RED}❌ Redis is not running or accessible${NC}"
        exit 1
    fi
}

# Function to backup PostgreSQL database
backup_database() {
    echo -e "${YELLOW}🗄️  Backing up PostgreSQL database...${NC}"
    
    check_postgres
    
    BACKUP_FILE="${BACKUP_DIR}/database_${BACKUP_TYPE}_${TIMESTAMP}.sql"
    
    # Create database backup
    if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
        --verbose --clean --create --if-exists > "${BACKUP_FILE}"; then
        echo -e "${GREEN}✅ Database backup completed: ${BACKUP_FILE}${NC}"
        
        # Compress the backup
        gzip "${BACKUP_FILE}"
        echo -e "${GREEN}✅ Database backup compressed: ${BACKUP_FILE}.gz${NC}"
        
        # Get file size
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        echo -e "${YELLOW}📊 Backup size: ${BACKUP_SIZE}${NC}"
    else
        echo -e "${RED}❌ Database backup failed${NC}"
        exit 1
    fi
}

# Function to backup Redis data
backup_redis() {
    echo -e "${YELLOW}🔴 Backing up Redis data...${NC}"
    
    check_redis
    
    BACKUP_FILE="${BACKUP_DIR}/redis_${BACKUP_TYPE}_${TIMESTAMP}.rdb"
    
    # Trigger Redis SAVE command
    if redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" SAVE > /dev/null 2>&1; then
        # Copy the RDB file
        REDIS_RDB=$(redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" CONFIG GET dir | tail -n 1)
        if [ -f "${REDIS_RDB}/dump.rdb" ]; then
            cp "${REDIS_RDB}/dump.rdb" "${BACKUP_FILE}"
            echo -e "${GREEN}✅ Redis backup completed: ${BACKUP_FILE}${NC}"
            
            # Compress the backup
            gzip "${BACKUP_FILE}"
            echo -e "${GREEN}✅ Redis backup compressed: ${BACKUP_FILE}.gz${NC}"
        else
            echo -e "${YELLOW}⚠️  Redis RDB file not found, skipping Redis backup${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Redis SAVE command failed, skipping Redis backup${NC}"
    fi
}

# Function to backup uploads directory
backup_uploads() {
    echo -e "${YELLOW}📁 Backing up uploads directory...${NC}"
    
    if [ -d "${UPLOADS_DIR}" ]; then
        BACKUP_FILE="${BACKUP_DIR}/uploads_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz"
        
        if tar -czf "${BACKUP_FILE}" -C "${UPLOADS_DIR}" .; then
            echo -e "${GREEN}✅ Uploads backup completed: ${BACKUP_FILE}${NC}"
            
            # Get file size
            BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
            echo -e "${YELLOW}📊 Backup size: ${BACKUP_SIZE}${NC}"
        else
            echo -e "${RED}❌ Uploads backup failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Uploads directory not found, skipping uploads backup${NC}"
    fi
}

# Function to backup configuration files
backup_config() {
    echo -e "${YELLOW}⚙️  Backing up configuration files...${NC}"
    
    BACKUP_FILE="${BACKUP_DIR}/config_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz"
    
    # Create temporary directory for config files
    TEMP_DIR=$(mktemp -d)
    
    # Copy important config files
    if [ -f "config.env" ]; then
        cp config.env "${TEMP_DIR}/"
    fi
    if [ -f ".env.production" ]; then
        cp .env.production "${TEMP_DIR}/"
    fi
    if [ -d "nginx" ]; then
        cp -r nginx "${TEMP_DIR}/"
    fi
    if [ -d "monitoring" ]; then
        cp -r monitoring "${TEMP_DIR}/"
    fi
    
    # Create config backup
    if tar -czf "${BACKUP_FILE}" -C "${TEMP_DIR}" .; then
        echo -e "${GREEN}✅ Configuration backup completed: ${BACKUP_FILE}${NC}"
        
        # Clean up temp directory
        rm -rf "${TEMP_DIR}"
        
        # Get file size
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
        echo -e "${YELLOW}📊 Backup size: ${BACKUP_SIZE}${NC}"
    else
        echo -e "${RED}❌ Configuration backup failed${NC}"
        rm -rf "${TEMP_DIR}"
        exit 1
    fi
}

# Function to create backup manifest
create_manifest() {
    echo -e "${YELLOW}📋 Creating backup manifest...${NC}"
    
    MANIFEST_FILE="${BACKUP_DIR}/backup_manifest_${TIMESTAMP}.json"
    
    cat > "${MANIFEST_FILE}" << EOF
{
  "backup_id": "${TIMESTAMP}",
  "backup_type": "${BACKUP_TYPE}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "retention_days": ${RETENTION_DAYS},
  "files": [
EOF
    
    # Add database backup
    if [ -f "${BACKUP_DIR}/database_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz" ]; then
        echo "    \"database_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz\"," >> "${MANIFEST_FILE}"
    fi
    
    # Add Redis backup
    if [ -f "${BACKUP_DIR}/redis_${BACKUP_TYPE}_${TIMESTAMP}.rdb.gz" ]; then
        echo "    \"redis_${BACKUP_TYPE}_${TIMESTAMP}.rdb.gz\"," >> "${MANIFEST_FILE}"
    fi
    
    # Add uploads backup
    if [ -f "${BACKUP_DIR}/uploads_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz" ]; then
        echo "    \"uploads_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz\"," >> "${MANIFEST_FILE}"
    fi
    
    # Add config backup
    if [ -f "${BACKUP_DIR}/config_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz" ]; then
        echo "    \"config_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz\"" >> "${MANIFEST_FILE}"
    fi
    
    cat >> "${MANIFEST_FILE}" << EOF
  ],
  "system_info": {
    "hostname": "$(hostname)",
    "os": "$(uname -s)",
    "kernel": "$(uname -r)",
    "disk_usage": "$(df -h / | tail -1 | awk '{print $5}')"
  }
}
EOF
    
    echo -e "${GREEN}✅ Backup manifest created: ${MANIFEST_FILE}${NC}"
}

# Function to clean old backups
cleanup_old_backups() {
    echo -e "${YELLOW}🧹 Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
    
    # Find and remove old backup files
    find "${BACKUP_DIR}" -name "*.gz" -type f -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}" -name "*.sql" -type f -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}" -name "*.rdb" -type f -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}" -name "backup_manifest_*.json" -type f -mtime +${RETENTION_DAYS} -delete
    
    echo -e "${GREEN}✅ Old backups cleaned up${NC}"
}

# Function to verify backup integrity
verify_backups() {
    echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
    
    VERIFICATION_FAILED=false
    
    # Verify database backup
    if [ -f "${BACKUP_DIR}/database_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz" ]; then
        if gzip -t "${BACKUP_DIR}/database_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"; then
            echo -e "${GREEN}✅ Database backup verification passed${NC}"
        else
            echo -e "${RED}❌ Database backup verification failed${NC}"
            VERIFICATION_FAILED=true
        fi
    fi
    
    # Verify uploads backup
    if [ -f "${BACKUP_DIR}/uploads_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz" ]; then
        if tar -tzf "${BACKUP_DIR}/uploads_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Uploads backup verification passed${NC}"
        else
            echo -e "${RED}❌ Uploads backup verification failed${NC}"
            VERIFICATION_FAILED=true
        fi
    fi
    
    # Verify config backup
    if [ -f "${BACKUP_DIR}/config_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz" ]; then
        if tar -tzf "${BACKUP_DIR}/config_${BACKUP_TYPE}_${TIMESTAMP}.tar.gz" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Configuration backup verification passed${NC}"
        else
            echo -e "${RED}❌ Configuration backup verification failed${NC}"
            VERIFICATION_FAILED=true
        fi
    fi
    
    if [ "$VERIFICATION_FAILED" = true ]; then
        echo -e "${RED}❌ Backup verification failed${NC}"
        exit 1
    fi
}

# Main backup execution
case "${BACKUP_TYPE}" in
    "full")
        echo -e "${GREEN}🔄 Starting full backup...${NC}"
        backup_database
        backup_redis
        backup_uploads
        backup_config
        ;;
    "database")
        echo -e "${GREEN}🔄 Starting database backup...${NC}"
        backup_database
        ;;
    "uploads")
        echo -e "${GREEN}🔄 Starting uploads backup...${NC}"
        backup_uploads
        ;;
    "config")
        echo -e "${GREEN}🔄 Starting configuration backup...${NC}"
        backup_config
        ;;
    *)
        echo -e "${RED}❌ Invalid backup type: ${BACKUP_TYPE}${NC}"
        echo -e "${YELLOW}Valid types: full, database, uploads, config${NC}"
        exit 1
        ;;
esac

# Create manifest and cleanup
create_manifest
cleanup_old_backups
verify_backups

# Show backup summary
echo -e "${GREEN}🎉 Backup process completed successfully!${NC}"
echo -e "${YELLOW}📊 Backup summary:${NC}"
echo -e "${YELLOW}   - Type: ${BACKUP_TYPE}${NC}"
echo -e "${YELLOW}   - Timestamp: ${TIMESTAMP}${NC}"
echo -e "${YELLOW}   - Directory: ${BACKUP_DIR}${NC}"
echo -e "${YELLOW}   - Retention: ${RETENTION_DAYS} days${NC}"

# List backup files
echo -e "${YELLOW}📁 Backup files created:${NC}"
ls -lh "${BACKUP_DIR}"/*"${TIMESTAMP}"* 2>/dev/null || echo "No backup files found"

echo -e "${GREEN}✅ Backup process completed at $(date)${NC}"
