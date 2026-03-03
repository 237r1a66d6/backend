# 🚀 Production Deployment Guide - SAIRA ACAD Backend

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Security Configuration](#security-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Backup & Recovery](#backup--recovery)

---

## Pre-Deployment Checklist

### ✅ Required Steps

- [ ] Generate strong JWT_SECRET
- [ ] Update ALLOWED_ORIGINS with production domain(s)
- [ ] Change DEFAULT_ADMIN_PASSWORD
- [ ] Set NODE_ENV=production
- [ ] Review rate limiting settings
- [ ] Test all API endpoints
- [ ] Verify database backup system
- [ ] Configure CORS properly
- [ ] Remove all console.logs from sensitive operations
- [ ] Ensure .env is in .gitignore

### 📋 Optional but Recommended

- [ ] Set up SSL/TLS certificate
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (e.g., PM2, New Relic)
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Configure error reporting (e.g., Sentry)

---

## Environment Setup

### 1. Generate Strong JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Create Production .env File

Copy `.env.example` to `.env` and update all values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration (REQUIRED)
JWT_SECRET=<your-generated-secret-here>

# Database Configuration
DATABASE_PATH=./saira-acad.db

# Admin Credentials (CHANGE THESE!)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<strong-password-here>

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Backup Configuration
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
```

### 3. Install Dependencies

```bash
npm install --production
```

---

## Security Configuration

### Security Features Enabled:

✅ **Helmet.js** - Security headers
✅ **Rate Limiting** - DDoS protection
✅ **CORS** - Cross-origin protection
✅ **JWT Authentication** - Secure auth
✅ **Input Validation** - Data sanitization
✅ **Compression** - Response optimization
✅ **Request Size Limits** - 10MB max

### Additional Security Recommendations:

1. **Use HTTPS Only**
   - Enforce SSL/TLS in production
   - Configure reverse proxy (Nginx/Apache) with SSL

2. **Database Security**
   - Regular backups (automated)
   - Restrict file permissions
   - Keep database file outside web root

3. **Regular Updates**
   ```bash
   npm audit
   npm audit fix
   ```

---

## Deployment Platforms

### Option 1: Render.com (Recommended)

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your Git repository

2. **Configure Service**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Environment Variables**
   Add all variables from your `.env` file

4. **Deploy**
   - Render will auto-deploy on git push

### Option 2: Railway.app

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"

2. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables in dashboard

3. **Deploy**
   - Automatic deployment on push

### Option 3: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-here
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com

# Deploy
git push heroku main
```

### Option 4: VPS (Digital Ocean, AWS, etc.)

#### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# (Add your environment variables)

# Start with PM2
pm2 start server.js --name saira-backend

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

#### 3. Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/saira-backend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/saira-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "OK",
  "message": "SAIRA ACAD API is running",
  "timestamp": "2026-03-03T...",
  "environment": "production",
  "uptime": 123.45
}
```

### 2. Test Key Endpoints

- [ ] User registration: `POST /api/users/register`
- [ ] User login: `POST /api/users/login`
- [ ] Admin login: `POST /api/admin/login`
- [ ] Forms submission
- [ ] File uploads

### 3. Monitor Logs

```bash
# PM2 logs (if using PM2)
pm2 logs saira-backend

# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log
```

---

## Monitoring & Maintenance

### PM2 Monitoring (VPS Deployment)

```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs saira-backend

# Restart application
pm2 restart saira-backend

# Reload without downtime
pm2 reload saira-backend

# View application info
pm2 info saira-backend
```

### Health Checks

Set up periodic health checks:

```bash
# Cron job for health monitoring
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Health check failed"
```

### Log Rotation

Configure log rotation in `/etc/logrotate.d/saira-backend`:

```
/path/to/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Backup & Recovery

### Automated Backups

#### 1. Manual Backup

```bash
node utils/backup.js
```

#### 2. Automated Daily Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/backend && node utils/backup.js
```

#### 3. Backup to Cloud Storage

Consider using:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Backblaze B2

### Database Restore

```javascript
// Restore from latest backup
node -e "require('./utils/backup').restoreDatabase()"

// Restore from specific backup
node -e "require('./utils/backup').restoreDatabase('saira-acad-backup-2026-03-03.db')"
```

---

## Performance Optimization

### 1. Enable Compression (✅ Already configured)

Response compression is enabled via the `compression` middleware.

### 2. Database Optimization

```bash
# Run optimization script
node optimize-database.js
```

### 3. Caching Strategy

Consider implementing:
- Redis for session storage
- CDN for static assets
- HTTP caching headers

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

#### 2. Database Locked
```bash
# Check for other processes
lsof | grep saira-acad.db
```

#### 3. Out of Memory
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js

# Or in PM2
pm2 start server.js --node-args="--max-old-space-size=4096"
```

---

## Support & Maintenance

### Regular Tasks

- **Daily:** Monitor logs and health checks
- **Weekly:** Review backup integrity
- **Monthly:** Update dependencies (`npm audit`, `npm update`)
- **Quarterly:** Security audit

### Useful Commands

```bash
# View application status
pm2 status

# View detailed logs
pm2 logs --lines 100

# Restart application
pm2 restart saira-backend

# Monitor resources
pm2 monit

# Update application (zero-downtime)
git pull
npm install --production
pm2 reload saira-backend
```

---

## Emergency Procedures

### Application Down

1. Check logs: `pm2 logs saira-backend`
2. Check system resources: `htop`
3. Restart: `pm2 restart saira-backend`
4. If persistent: Restore from backup

### Data Loss

1. Stop application
2. Restore database from backup
3. Verify data integrity
4. Restart application

---

## Contact & Resources

- **Node.js Docs:** https://nodejs.org/docs
- **Express.js:** https://expressjs.com
- **PM2:** https://pm2.keymetrics.io
- **Nginx:** https://nginx.org/en/docs

---

**Last Updated:** March 3, 2026
**Version:** 1.0.0

✅ Your SAIRA ACAD backend is now production-ready!
