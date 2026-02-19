# 🚀 Deployment Guide

## Prerequisites
- Node.js v14.0.0 or higher
- npm v6.0.0 or higher

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secure-random-string-here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Deployment Options

### 1. **Heroku**

```bash
# Install Heroku CLI
# Create new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secure-random-string
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com

# Deploy
git push heroku main
```

### 2. **Railway**

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-random-string`
   - `ALLOWED_ORIGINS=https://yourdomain.com`
3. Railway will auto-deploy on push

### 3. **Render**

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### 4. **VPS (Ubuntu/Linux)**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name saira-backend

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/saira-backend

# Add this configuration:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/saira-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. **Vercel** (Serverless)

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## Database
- SQLite database (`saira-acad.db`) will be auto-created on first run
- For production, consider migrating to PostgreSQL or MySQL
- Database file location: `backend/saira-acad.db`

## Security Checklist
- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure `ALLOWED_ORIGINS` with your production domains only
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS on your domain
- [ ] Keep dependencies updated
- [ ] Add rate limiting for APIs
- [ ] Setup logging and monitoring

## Post-Deployment
1. Test all API endpoints
2. Verify CORS settings
3. Check database connections
4. Monitor server logs
5. Setup automated backups for database

## Health Check
Your API will be available at: `https://yourdomain.com/api/health`

Response:
```json
{
  "status": "OK",
  "message": "SAIRA ACAD API is running",
  "timestamp": "2026-01-22T..."
}
```

## Troubleshooting
- **CORS errors**: Check `ALLOWED_ORIGINS` environment variable
- **Database errors**: Ensure write permissions for database file
- **Auth errors**: Verify `JWT_SECRET` is set correctly
- **Port errors**: Check if PORT is available or set via environment variable
