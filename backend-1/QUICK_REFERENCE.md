# 🎯 Quick Reference - Production Commands

## NPM Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Start with production environment
npm run prod

# Create database backup
npm run backup

# Check server health
npm run health

# View error logs (Unix/Linux)
npm run logs:error

# View combined logs (Unix/Linux)
npm run logs:combined
```

## Common Tasks

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 4. Edit .env and add the generated secret
# Also update other environment variables

# 5. Start the server
npm start
```

### Deploy to Production

```bash
# 1. Update code
git pull origin main

# 2. Install dependencies
npm install --production

# 3. Create backup (if database exists)
npm run backup

# 4. Restart server
# (Depends on your hosting platform)
pm2 restart saira-backend  # For PM2
# or
# Platform-specific restart command
```

### Database Management

```bash
# Create backup
npm run backup

# Restore from backup
node -e "require('./utils/backup').restoreDatabase()"

# Restore from specific backup file
node -e "require('./utils/backup').restoreDatabase('saira-acad-backup-2026-03-03.db')"

# View database
node view-database.js

# Optimize database
node optimize-database.js
```

### Monitoring

```bash
# Check if server is running
npm run health

# Check with custom URL
PRODUCTION_URL=https://yourdomain.com npm run health

# View logs (Unix/Linux/Mac)
tail -f logs/error.log
tail -f logs/combined.log
tail -f access.log

# View logs (Windows PowerShell)
Get-Content logs/error.log -Wait -Tail 50
Get-Content logs/combined.log -Wait -Tail 50
```

### PM2 Commands (VPS Deployment)

```bash
# Start application
pm2 start server.js --name saira-backend

# Restart
pm2 restart saira-backend

# Stop
pm2 stop saira-backend

# View logs
pm2 logs saira-backend

# Monitor
pm2 monit

# View status
pm2 status

# Reload without downtime
pm2 reload saira-backend

# Start on system boot
pm2 startup
pm2 save
```

## Security

### Generate Secrets

```bash
# JWT Secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# API Key (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update
```

## Troubleshooting

### Server Won't Start

```bash
# Check if port is in use (Unix/Linux/Mac)
lsof -i :5000
sudo kill -9 <PID>

# Check if port is in use (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Check environment variables
node -e "console.log(process.env)"

# Verify .env file exists
cat .env  # Unix/Linux/Mac
type .env  # Windows
```

### Database Issues

```bash
# Check database file exists
ls -lh saira-acad.db  # Unix/Linux/Mac
dir saira-acad.db  # Windows

# Check database permissions (Unix/Linux/Mac)
chmod 644 saira-acad.db

# Restore from backup
npm run backup
node -e "require('./utils/backup').restoreDatabase()"
```

### Memory Issues

```bash
# Check memory usage
free -h  # Unix/Linux
top  # Unix/Linux/Mac
Get-Process  # Windows PowerShell

# Increase Node.js memory limit
node --max-old-space-size=4096 server.js

# With PM2
pm2 start server.js --node-args="--max-old-space-size=4096" --name saira-backend
```

## API Endpoints

### Health Check
```bash
curl https://yourdomain.com/api/health
```

### Admin Login
```bash
curl -X POST https://yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### User Registration
```bash
curl -X POST https://yourdomain.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

## File Locations

```
backend/
├── server.js                      # Main application entry
├── .env                          # Environment variables (DO NOT COMMIT)
├── saira-acad.db                 # SQLite database
├── logs/                         # Application logs
│   ├── error.log                 # Error logs only
│   └── combined.log              # All logs
├── backups/                      # Database backups
│   ├── saira-acad-latest.db     # Latest backup
│   └── saira-acad-backup-*.db   # Timestamped backups
├── uploads/                      # User uploaded files
│   └── resumes/                 # Resume uploads
└── utils/                        # Utility scripts
    ├── backup.js                 # Backup utilities
    ├── health-check.js           # Health monitoring
    └── logger.js                 # Logging utilities
```

## Documentation

- **Production Guide:** `PRODUCTION_GUIDE.md` - Complete deployment guide
- **Deployment:** `DEPLOYMENT.md` - Platform-specific deployment
- **Checklist:** `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist
- **This File:** `QUICK_REFERENCE.md` - Quick command reference

## Support

For detailed information, see:
- `PRODUCTION_GUIDE.md` for comprehensive production setup
- `PRODUCTION_CHECKLIST.md` for deployment checklist
- API documentation at root endpoint: `https://yourdomain.com/`

---

**Last Updated:** March 3, 2026
