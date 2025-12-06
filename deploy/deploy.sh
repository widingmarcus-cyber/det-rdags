#!/bin/bash
# Bobot One-Click Deployment Script
# Run this from your local machine in the project root directory

set -e

SERVER_IP="46.62.253.123"
DOMAIN="bobot.nu"
SSH_USER="root"

echo "=========================================="
echo "  Bobot Deployment to $DOMAIN"
echo "=========================================="
echo ""

# Check if we can connect
echo "[1/5] Testing SSH connection..."
ssh -o ConnectTimeout=10 $SSH_USER@$SERVER_IP "echo 'Connected!'" || {
    echo "ERROR: Cannot connect to $SERVER_IP"
    echo "Make sure you can SSH into the server first."
    exit 1
}

# Upload project files
echo "[2/5] Uploading project files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.db' \
    --exclude '__pycache__' \
    --exclude 'venv' \
    --exclude '.env' \
    --exclude 'dist' \
    ./ $SSH_USER@$SERVER_IP:/opt/bobot/

# Upload production configs
echo "[3/5] Uploading production configs..."
scp deploy/.env.prod $SSH_USER@$SERVER_IP:/opt/bobot/.env
scp deploy/nginx.conf $SSH_USER@$SERVER_IP:/opt/bobot/nginx-site.conf

# Run server setup
echo "[4/5] Setting up server..."
ssh $SSH_USER@$SERVER_IP 'bash -s' << 'ENDSSH'
set -e

cd /opt/bobot

# Update and install dependencies
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx ufw curl

# Start Docker
systemctl enable docker
systemctl start docker

# Configure firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup nginx
cp nginx-site.conf /etc/nginx/sites-available/bobot
ln -sf /etc/nginx/sites-available/bobot /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "Server setup complete!"
ENDSSH

# Get SSL and start containers
echo "[5/5] Getting SSL certificate and starting services..."
ssh $SSH_USER@$SERVER_IP "bash -s" << ENDSSH
set -e
cd /opt/bobot

# Get SSL certificate (includes demo subdomain)
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d demo.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect || true

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
echo "Waiting for services to start..."
sleep 15

# Pull AI model
echo "Downloading AI model (this takes a few minutes)..."
docker exec bobot-ollama ollama pull qwen2.5:7b-instruct

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "  Admin Panel:  https://$DOMAIN"
echo "  Demo Site:    https://demo.$DOMAIN"
echo "  Widget:       https://$DOMAIN/widget.js"
echo ""
echo "  Login credentials:"
echo "    Company: demo / demo123"
echo "    Admin:   admin / (check .env for ADMIN_PASSWORD)"
echo ""
ENDSSH

echo ""
echo "Done! Visit https://$DOMAIN or https://demo.$DOMAIN"
