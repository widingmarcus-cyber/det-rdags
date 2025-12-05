# Deployment Checklist - Next Session

This checklist covers all changes that need to be deployed to production after this session.

## Changes Made This Session

### 1. SuperAdmin Panel Redesign
- Extracted components into `/admin-panel/src/components/superadmin/`
- New sidebar navigation
- Reduced SuperAdmin.jsx from ~5400 to ~3200 lines

### 2. Bug Fixes
- **Knowledge import**: Fixed response field mismatch (`items_added` → `imported`)
- **Nginx error handling**: Added custom error pages for 502/503/504
- **Templates missing**: Added templates directory to Dockerfile

### 3. Infrastructure Updates
- **nginx.conf**: Full HTTPS configuration with HTTP→HTTPS redirect
- **nginx.conf**: SSL certificates configuration for Let's Encrypt
- **nginx.conf**: HSTS security headers added
- **nginx.conf**: Catch-all server block for undefined hosts

### 4. New Features
- **Favicon**: Added Bobot mascot favicon (`/admin-panel/public/favicon.svg`)
- **Meta tags**: Added theme-color, description, apple-touch-icon

### 5. Documentation
- Removed `bobot_specifikation.md`
- Rewrote `CLAUDE.md` and `README.md`
- Generalized product description (removed fastighetsbolag focus)

---

## Deployment Steps

### Step 1: Pull Changes
```bash
cd /path/to/bobot
git pull origin main
```

### Step 2: Backup Database
```bash
cp backend/bobot.db backend/bobot.db.backup.$(date +%Y%m%d)
```

### Step 3: Rebuild Docker Images
```bash
# Rebuild all services
docker-compose -f deploy/docker-compose.prod.yml build

# Or rebuild specific services
docker-compose -f deploy/docker-compose.prod.yml build backend
docker-compose -f deploy/docker-compose.prod.yml build admin
docker-compose -f deploy/docker-compose.prod.yml build widget
```

### Step 4: Update SSL Certificate (if needed)
```bash
# Add demo.bobot.nu to certificate
sudo certbot --nginx -d bobot.nu -d www.bobot.nu -d demo.bobot.nu
```

### Step 5: Deploy Services
```bash
# Stop current services
docker-compose -f deploy/docker-compose.prod.yml down

# Start updated services
docker-compose -f deploy/docker-compose.prod.yml up -d
```

### Step 6: Update Nginx Configuration
```bash
# Test nginx config
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 7: Verify Deployment
```bash
# Check services are running
docker ps

# Check backend logs
docker-compose -f deploy/docker-compose.prod.yml logs -f backend

# Test health endpoint
curl https://bobot.nu/api/health

# Test templates endpoint
curl https://bobot.nu/api/templates
```

---

## Security Issues to Address (From Code Review)

### CRITICAL - Do Immediately

1. **Rotate Production Credentials**
   - Generate new SECRET_KEY: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - Change ADMIN_PASSWORD to something strong
   - Update .env.prod with new credentials
   - Consider removing .env.prod from git history

2. **Add .env.prod to .gitignore**
   ```bash
   echo "deploy/.env.prod" >> .gitignore
   ```

### HIGH Priority - Next Sprint

3. **GDPR Endpoint Authorization**
   - Add authentication to `/gdpr/{company_id}/consent`
   - Add authentication to `/gdpr/{company_id}/my-data`
   - Use secure session ID generation (UUID v4)

4. **Move Auth Tokens to HttpOnly Cookies**
   - Update backend to set JWT in HttpOnly cookie
   - Update frontend to not use localStorage for tokens
   - Add CSRF protection

5. **Improve Rate Limiting**
   - Consider Redis for persistent rate limiting
   - Implement sliding window algorithm
   - Fix atomic clearing issue

### MEDIUM Priority

6. **File Upload Security**
   - Add magic byte validation (python-magic)
   - Validate Content-Type headers

7. **Error Handling**
   - Don't expose exception details in API responses
   - Return generic error messages to clients

8. **Disable Demo Data in Production**
   - Set `ENABLE_DEMO_DATA=false` in production

---

## Post-Deployment Verification

- [ ] https://bobot.nu loads admin panel
- [ ] https://demo.bobot.nu loads widget demo
- [ ] HTTP redirects to HTTPS
- [ ] No "Welcome to nginx" page on refresh
- [ ] Templates show in knowledge base
- [ ] Knowledge import (URL and file) works
- [ ] Chat functionality works
- [ ] Super admin login works
- [ ] Favicon shows in browser tab
- [ ] No browser security warnings

---

## Rollback Plan

If deployment fails:

```bash
# Stop services
docker-compose -f deploy/docker-compose.prod.yml down

# Restore database backup
cp backend/bobot.db.backup.YYYYMMDD backend/bobot.db

# Checkout previous version
git checkout HEAD~1

# Rebuild and restart
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d
```

---

## Notes

- SSL certificate expires: March 4, 2026
- Consider setting up automated SSL renewal monitoring
- AI model: Qwen 2.5 14B (ensure Ollama container has the model)
