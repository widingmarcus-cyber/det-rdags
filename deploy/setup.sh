#!/bin/bash
# Bobot Production Deployment Script
# Server: 46.62.253.123
# Domain: bobot.nu

set -e

DOMAIN="bobot.nu"
EMAIL="admin@bobot.nu"  # For Let's Encrypt notifications

echo "=========================================="
echo "  Bobot Production Deployment"
echo "  Domain: $DOMAIN"
echo "=========================================="

# Update system
echo "[1/8] Updating system..."
apt update && apt upgrade -y

# Install required packages
echo "[2/8] Installing dependencies..."
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    certbot \
    python3-certbot-nginx \
    nginx

# Install Docker
echo "[3/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "[4/8] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall
echo "[5/8] Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create app directory
echo "[6/8] Setting up application..."
mkdir -p /opt/bobot
cd /opt/bobot

# Check if files exist, if not prompt to upload
if [ ! -f "docker-compose.prod.yml" ]; then
    echo ""
    echo "ERROR: Production files not found in /opt/bobot"
    echo ""
    echo "Please upload the following files to /opt/bobot:"
    echo "  - docker-compose.prod.yml"
    echo "  - nginx.conf"
    echo "  - .env.prod"
    echo ""
    echo "You can use scp from your local machine:"
    echo "  scp deploy/docker-compose.prod.yml deploy/nginx.conf deploy/.env.prod root@46.62.253.123:/opt/bobot/"
    echo ""
    exit 1
fi

# Copy nginx config
echo "[7/8] Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/bobot
ln -sf /etc/nginx/sites-available/bobot /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Start nginx (needed for certbot)
systemctl start nginx
systemctl enable nginx

# Get SSL certificate (includes demo subdomain)
echo "[8/8] Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d demo.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Start application
echo "Starting Bobot..."
cd /opt/bobot
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Pull Ollama model
echo "Downloading AI model (this may take a few minutes)..."
docker exec bobot-ollama ollama pull qwen2.5:14b

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "  Admin Panel:  https://$DOMAIN"
echo "  Demo Site:    https://demo.$DOMAIN"
echo "  API:          https://$DOMAIN/api"
echo "  Widget:       https://$DOMAIN/widget.js"
echo ""
echo "  Default credentials:"
echo "    Company: demo / demo123"
echo "    Admin:   admin / admin123"
echo ""
echo "  IMPORTANT: Change these passwords after first login!"
echo ""
