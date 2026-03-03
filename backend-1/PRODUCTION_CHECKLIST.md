# 🎯 Production Deployment Checklist

Use this checklist before deploying to production.

## 📋 Pre-Deployment

### Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Set `NODE_ENV=production`
- [ ] Update `ALLOWED_ORIGINS` with production domain(s)
- [ ] Change `DEFAULT_ADMIN_PASSWORD` to a strong password
- [ ] Set appropriate `PORT` (usually handled by hosting platform)

### Security Review
- [ ] Verify `.env` is in `.gitignore`
- [ ] Review rate limiting settings
- [ ] Confirm CORS configuration
- [ ] Check JWT expiration settings
- [ ] Verify admin authentication is working
- [ ] Test file upload size limits

### Code Quality
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Remove all debug console.logs
- [ ] Test all API endpoints
- [ ] Verify error handling
- [ ] Check database schema is up to date

### Dependencies
- [ ] Run `npm install --production` to verify
- [ ] Check for outdated packages: `npm outdated`
- [ ] Update critical packages if needed

## 🚀 Deployment

### Platform Setup
- [ ] Choose deployment platform (Render, Railway, Heroku, VPS)
- [ ] Create new project/service
- [ ] Connect Git repository
- [ ] Configure build command: `npm install`
- [ ] Configure start command: `npm start`

### Environment Variables (Add to hosting platform)
```
NODE_ENV=production
JWT_SECRET=<generated-secret>
ALLOWED_ORIGINS=https://yourdomain.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<strong-password>
BACKUP_RETENTION_DAYS=30
LOG_LEVEL=info
```

### Database
- [ ] Database will auto-create on first run
- [ ] Default admin account will be created
- [ ] Verify database file permissions

## ✅ Post-Deployment

### Verification
- [ ] Test health endpoint: `https://yourdomain.com/api/health`
- [ ] Verify response shows `"environment": "production"`
- [ ] Test admin login
- [ ] Test user registration and login
- [ ] Test form submissions
- [ ] Verify file uploads work
- [ ] Check CORS is working from frontend

### Monitoring Setup
- [ ] Verify logs are being created
- [ ] Set up log monitoring
- [ ] Configure uptime monitoring
- [ ] Test backup system: `npm run backup`
- [ ] Set up automated backups (cron/scheduled task)

### Performance
- [ ] Check response times
- [ ] Verify compression is working (check response headers)
- [ ] Test rate limiting
- [ ] Monitor memory usage
- [ ] Check database query performance

## 📊 Ongoing Maintenance

### Daily
- [ ] Monitor error logs
- [ ] Check health endpoint
- [ ] Verify uptime

### Weekly
- [ ] Review backup integrity
- [ ] Check log files size
- [ ] Monitor resource usage
- [ ] Review error patterns

### Monthly
- [ ] Run `npm audit`
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Security review

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Database optimization
- [ ] Update Node.js version if needed

## 🆘 Emergency Contacts & Procedures

### If Site Goes Down
1. Check health endpoint
2. Review recent logs: `npm run logs:error`
3. Check hosting platform status
4. Restart application
5. If persistent: Restore from backup

### Database Issues
1. Stop application
2. Create backup: `npm run backup`
3. Check database integrity
4. Restore if needed
5. Restart application

### Security Incident
1. Rotate JWT_SECRET immediately
2. Force logout all users
3. Review access logs
4. Change admin passwords
5. Audit recent database changes

## 📞 Support Resources

- **Documentation:** See `PRODUCTION_GUIDE.md`
- **Deployment:** See `DEPLOYMENT.md`
- **API Docs:** `https://yourdomain.com/` (root endpoint shows API structure)

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

Last Updated: March 3, 2026
