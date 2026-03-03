# 🚀 SAIRA ACAD Backend - Production Ready

A production-ready backend API for the SAIRA ACAD platform with comprehensive security, monitoring, and deployment features.

## ✨ Features

- 🔒 **Security**: Helmet.js, rate limiting, CORS protection, JWT authentication
- 📊 **Monitoring**: Health checks, request logging, error tracking
- ⚡ **Performance**: Response compression, optimized database queries
- 🛡️ **Reliability**: Graceful shutdown, automated backups, error handling
- 📦 **Database**: SQLite with Sequelize ORM, automated backups
- 🌐 **Cross-Device Auth**: User authentication with JWT tokens
- 📝 **Comprehensive Logging**: File and console logging for production

## 🎯 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update `.env` with:
- Your generated `JWT_SECRET`
- `NODE_ENV=production` for production
- Your domain(s) in `ALLOWED_ORIGINS` (or keep `*` for all origins)
- A strong `DEFAULT_ADMIN_PASSWORD`

### 3. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000` (or your configured PORT).

## 🔧 NPM Scripts

```bash
npm start         # Start production server
npm run dev       # Start with auto-reload (nodemon)
npm run prod      # Start with NODE_ENV=production
npm run backup    # Create database backup
npm run health    # Check server health
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server status and uptime

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/verify` - Verify token (Protected)
- `GET /api/users/me` - Get current user (Protected)
- `GET /api/users/profile/:id` - Get user profile (Protected)
- `PUT /api/users/profile/:id` - Update profile (Protected)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users (Protected)
- `GET /api/admin/stats` - Get statistics (Protected)
- `PUT /api/admin/users/:id/status` - Update user status (Protected)
- `DELETE /api/admin/users/:id` - Delete user (Protected)

### Forms
- `POST /api/forms/enrollment` - Course enrollment
- `POST /api/forms/school-requirement` - School requirements
- `POST /api/forms/teacher-application` - Teacher application
- `POST /api/forms/mentor-application` - Mentor application
- `POST /api/forms/job-application` - Job application
- `POST /api/forms/contact` - Contact form
- `POST /api/forms/consultation` - Consultation request

## 🚀 Deployment

### Render.com (Recommended)

1. Connect your repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

See [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Other Platforms

- **Railway**: Auto-detects and deploys
- **Heroku**: Use included `Procfile`
- **VPS**: See [DEPLOYMENT.md](DEPLOYMENT.md)

### Environment Variables

Required for all deployments:

```env
NODE_ENV=production
JWT_SECRET=<your-generated-secret>
ALLOWED_ORIGINS=*
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<strong-password>
```

## 🔒 Security Features

- **Helmet.js**: Security headers (XSS, CSP, etc.)
- **Rate Limiting**: 
  - General API: 100 requests/15min (configurable)
  - Auth endpoints: 5 attempts/15min
- **CORS**: Flexible origin control (supports `*` or specific domains)
- **JWT**: Secure token-based authentication
- **Input Validation**: Request data sanitization
- **Size Limits**: 10MB max request size

## 📊 Monitoring & Maintenance

### Database Backups

```bash
# Manual backup
npm run backup

# Automated backup (cron)
0 2 * * * cd /path/to/backend && npm run backup
```

Backups are stored in `backups/` directory with:
- Timestamped backups
- Latest backup for quick access
- Auto-cleanup (30 days retention)

### Health Monitoring

```bash
# Local check
npm run health

# Production check
PRODUCTION_URL=https://yourdomain.com npm run health
```

### Logs

- **access.log**: HTTP request logs (production)
- **logs/error.log**: Error logs only
- **logs/combined.log**: All application logs

## 🛠️ Database Management

### Auto-Created Tables

The database and tables are automatically created on first run:

- Users
- Admins (with default admin account)
- Enrollments
- Courses
- Contacts
- Consultations
- Applications (Teacher, Mentor, Job)
- School Partners & Requirements

### Default Admin

- **Username**: `admin` (or from `DEFAULT_ADMIN_USERNAME`)
- **Password**: `1234567@_a` (or from `DEFAULT_ADMIN_PASSWORD`)

⚠️ **Change the default password immediately in production!**

## 📁 Project Structure

```
backend-main/
├── config/          # Database configuration
├── middleware/      # Auth, upload middleware
│   ├── auth.js      # Admin authentication
│   └── userAuth.js  # User authentication
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility scripts
│   ├── backup.js    # Database backup
│   ├── logger.js    # Custom logger
│   └── health-check.js # Health monitoring
├── server.js        # Main application
├── package.json     # Dependencies
├── .env.example     # Environment template
└── render.yaml      # Render.com config
```

## 🔧 Utilities

### Backup Database
```bash
node utils/backup.js
```

### Restore Database
```javascript
node -e "require('./utils/backup').restoreDatabase()"
```

### Health Check
```bash
node utils/health-check.js
```

## 📚 Additional Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) - Render.com specific
- [CROSS_DEVICE_AUTH_GUIDE.md](CROSS_DEVICE_AUTH_GUIDE.md) - Authentication setup
- [LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md) - Login troubleshooting

## 🆘 Troubleshooting

### Server Won't Start

```bash
# Check environment variables
cat .env

# Verify JWT_SECRET is set
echo $JWT_SECRET
```

### Database Issues

```bash
# Check database file
ls -lh saira-acad.db

# Restore from backup
npm run backup
node -e "require('./utils/backup').restoreDatabase()"
```

### CORS Errors

Set `ALLOWED_ORIGINS=*` in `.env` to allow all origins, or specify your domains:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🔐 Security Best Practices

1. ✅ Use strong JWT_SECRET (64+ characters)
2. ✅ Change default admin password
3. ✅ Keep dependencies updated (`npm audit`)
4. ✅ Use HTTPS in production
5. ✅ Never commit .env file
6. ✅ Set appropriate CORS origins
7. ✅ Enable rate limiting
8. ✅ Regular database backups

## 📈 Performance Tips

- ✅ Compression enabled by default
- ✅ Database indexes configured
- ✅ Static file caching
- ✅ Request size limits
- ✅ Connection pooling

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review error logs: `logs/error.log`
3. Run health check: `npm run health`
4. Verify environment configuration

## 📄 License

ISC

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: March 3, 2026
