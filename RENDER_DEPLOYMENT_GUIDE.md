# 🚀 SAIRA ACAD - Render Deployment Guide

## ✅ PRE-DEPLOYMENT CHECKLIST

### Backend is Ready ✓
- [x] CORS configured to allow all origins (`origin: '*'`)
- [x] PORT configured with `process.env.PORT || 5000`
- [x] package.json has correct start script: `"start": "node server.js"`
- [x] Procfile exists with: `web: node server.js`
- [x] .env file configured for production
- [x] All dependencies installed (cors, express, sequelize, sqlite3, etc.)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Push Backend to GitHub

Your backend is already at: `https://github.com/237r1a66d6/backend.git`

To update it with latest changes:

```bash
cd C:\Users\bvsri\OneDrive\Desktop\Saira\backend
git add .
git commit -m "Configure backend for Render deployment with CORS"
git push origin main
```

---

### STEP 2: Deploy on Render (FREE)

1. **Go to Render**
   - Visit: https://render.com
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click: **New** → **Web Service**
   - Select repository: `237r1a66d6/backend`
   - Click **Connect**

3. **Configure Service Settings**

   | Setting | Value |
   |---------|-------|
   | **Name** | `saira-acad-backend` (or any name) |
   | **Environment** | `Node` |
   | **Region** | Choose closest to India (Singapore) |
   | **Branch** | `main` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | **Free** |

4. **Add Environment Variables**
   
   Click "Advanced" → Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `SAIRA_ACAD_2026_SECURE_JWT_KEY_CHANGE_THIS_PRODUCTION` |
   | `PORT` | Leave empty (Render auto-assigns) |

5. **Deploy**
   - Click **Create Web Service**
   - Wait 3-5 minutes for deployment ⏳

6. **Get Your Backend URL**
   
   After deployment, you'll see:
   ```
   https://saira-acad-backend.onrender.com
   ```
   
   **SAVE THIS URL!** You'll need it for frontend.

---

### STEP 3: Test Your Backend

Visit these URLs in browser:

1. **Root Endpoint:**
   ```
   https://saira-acad-backend.onrender.com/
   ```
   Should show: Welcome message with API endpoints

2. **Health Check:**
   ```
   https://saira-acad-backend.onrender.com/api/health
   ```
   Should show: `{"status": "OK", "message": "SAIRA ACAD API is running"}`

3. **Test API:**
   ```
   https://saira-acad-backend.onrender.com/api/admin/login
   ```
   POST request with admin credentials

✅ If all endpoints work → Backend is LIVE!

---

### STEP 4: Update Frontend for Hostinger

**Update API Configuration:**

Edit: `SAIRA/js/api-config.js`

```javascript
// Replace localhost with your Render backend URL
const API_BASE_URL = 'https://saira-acad-backend.onrender.com/api';

export default {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
        // User endpoints
        REGISTER: `${API_BASE_URL}/users/register`,
        LOGIN: `${API_BASE_URL}/users/login`,
        USER_PROFILE: `${API_BASE_URL}/users/profile`,
        
        // Admin endpoints
        ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
        ADMIN_USERS: `${API_BASE_URL}/admin/users`,
        ADMIN_STATS: `${API_BASE_URL}/admin/stats`,
        
        // Form endpoints
        ENROLLMENT: `${API_BASE_URL}/forms/enrollment`,
        CONTACT: `${API_BASE_URL}/forms/contact`,
        TEACHER_APPLICATION: `${API_BASE_URL}/forms/teacher-application`,
        MENTOR_APPLICATION: `${API_BASE_URL}/forms/mentor-application`,
        JOB_APPLICATION: `${API_BASE_URL}/forms/job-application`,
        SCHOOL_REQUIREMENT: `${API_BASE_URL}/forms/school-requirement`,
        CONSULTATION: `${API_BASE_URL}/forms/consultation`,
        
        // School Partner endpoints
        SCHOOL_PARTNER: `${API_BASE_URL}/school-partner`
    }
};
```

---

### STEP 5: Upload Frontend to Hostinger

1. **Login to Hostinger**
   - Go to: https://hostinger.com
   - Login to your account

2. **Access File Manager**
   - Dashboard → Hosting → File Manager
   - Navigate to `public_html`

3. **Upload Frontend Files**
   
   Upload ALL files from `SAIRA/` folder:
   - `index.html`
   - `about-us.html`
   - `contact-us.html`
   - `register.html`
   - `login.html`
   - All other HTML files
   - `css/` folder (complete)
   - `js/` folder (complete)
   - `assets/` folder (complete)

4. **Set Permissions**
   - Right-click folders → Permissions → 755
   - Right-click files → Permissions → 644

---

### STEP 6: Test Live Website

1. **Visit Your Domain**
   ```
   https://sairaacad.com
   ```

2. **Test Registration**
   - Go to: `https://sairaacad.com/register.html`
   - Fill form and submit
   - Check browser console (F12) for any errors

3. **Test Login**
   - Go to: `https://sairaacad.com/login.html`
   - Try logging in with registered account

4. **Test Admin Login**
   - Go to: `https://sairaacad.com/admin-login.html`
   - Username: `admin`
   - Password: `1234567@_a`

---

## 🔧 COMMON ISSUES & FIXES

### Issue 1: CORS Error
```
Access to fetch at 'https://saira-acad-backend.onrender.com' from origin 'https://sairaacad.com' has been blocked by CORS
```

**Fix:** Already handled! CORS is set to `origin: '*'` in server.js

---

### Issue 2: 404 Not Found
**Cause:** Wrong API route

**Fix:** 
- Check API_BASE_URL in `api-config.js`
- Ensure it ends with `/api` (e.g., `https://your-backend.onrender.com/api`)

---

### Issue 3: Backend Sleeping (Free Plan)
**Symptom:** First request takes 30-50 seconds

**Why:** Render free tier sleeps after 15 minutes of inactivity

**Solutions:**
- Wait patiently on first load
- Upgrade to paid plan ($7/month) for always-on
- Use a service like UptimeRobot to ping every 10 minutes

---

### Issue 4: Mixed Content Error
```
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

**Fix:** Ensure API_BASE_URL uses `https://` not `http://`

---

### Issue 5: Environment Variables Not Working
**Fix:** 
- Go to Render Dashboard → Your Service → Environment
- Add/Update variables
- Click "Save Changes"
- Redeploy

---

## 📊 RENDER DASHBOARD FEATURES

### View Logs
- Dashboard → Your Service → Logs
- See real-time server logs
- Debug API errors

### Manual Deploy
- Dashboard → Your Service → Manual Deploy
- Click "Deploy latest commit"

### Auto-Deploy from GitHub
- Enabled by default
- Every `git push` triggers auto-deploy
- Takes 2-3 minutes

---

## 🎯 POST-DEPLOYMENT TASKS

### 1. Update JWT Secret
On Render Dashboard:
- Environment → JWT_SECRET
- Change to: Strong random string (50+ characters)
- Example: Use https://randomkeygen.com/

### 2. Test All Features
- [ ] User Registration
- [ ] User Login
- [ ] Admin Login
- [ ] Contact Form
- [ ] Enrollment Form
- [ ] Teacher Application
- [ ] School Partner Form
- [ ] File Upload (Resume)

### 3. Monitor Performance
- Check Render logs daily
- Monitor response times
- Track API errors

### 4. Backup Database
Download `saira-acad.db` from Render:
- Connect via SSH (paid plans only)
- Or use database export tools

---

## 🚨 IMPORTANT NOTES

### Free Tier Limitations
- ✅ Unlimited deploys
- ✅ Automatic HTTPS
- ✅ 750 hours/month
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ Shared CPU

### Data Persistence
- SQLite database persists on Render
- But may be reset on redeployment
- For production, consider:
  - PostgreSQL (Render offers free tier)
  - MongoDB Atlas (free tier)

---

## 📞 SUPPORT

### Render Documentation
- https://render.com/docs

### SAIRA ACAD Backend
- Repository: https://github.com/237r1a66d6/backend
- Issues: Report on GitHub

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] Backend deployed on Render
- [ ] Backend URL tested (health check works)
- [ ] Frontend updated with Render backend URL
- [ ] Frontend uploaded to Hostinger
- [ ] HTTPS working on both frontend and backend
- [ ] User registration working
- [ ] User login working
- [ ] Admin login working (username: admin, password: 1234567@_a)
- [ ] All forms submitting successfully
- [ ] File uploads working
- [ ] No CORS errors in browser console
- [ ] Mobile responsive testing done

---

## 🎉 SUCCESS!

Your full-stack application is now LIVE!

**Frontend:** https://sairaacad.com  
**Backend:** https://your-backend-name.onrender.com

---

## 📝 NOTES

- Keep Render dashboard open during first deployment
- Monitor logs for any errors
- First cold start may take 50 seconds
- Subsequent requests will be fast (< 1 second)
- Consider paid plan ($7/month) if you need:
  - No sleep/always-on
  - More RAM (512MB → 2GB)
  - Faster builds

---

**Deployed by:** SAIRA ACAD Team  
**Date:** January 30, 2026  
**Version:** 1.0.0
