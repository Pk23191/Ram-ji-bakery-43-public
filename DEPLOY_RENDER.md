# 🚀 Render Backend Deployment Guide

## Create Render Account
1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → Select "Web Service"

## Connect GitHub
1. Click "Connect Repository"
2. Select: `Pk23191/Ram-ji-bakery-43-public`
3. Click "Connect"

## Configure Web Service

**Basic Settings:**
- Name: `ramji-bakery-api`
- Environment: `Node`
- Build Command: `npm --prefix server ci`
- Start Command: `npm --prefix server start`
- Instance Type: Free (or Paid if you want)

## Add Environment Variables

Click "Environment" tab and add these:

```
NODE_ENV=production
USE_MONGO=false
JWT_SECRET=<generate-a-long-random-secret-in-Render>

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=https://ram-ji-bakery23.vercel.app

ADMIN_EMAIL=admin@ramjibakery.in
ADMIN_PASSWORD=yourSecurePassword123

ADMIN_ROLE=superadmin

PORT=10000
```

**Note:** MongoDB is optional. Only add `MONGO_URI` when `USE_MONGO=true` and use a hosted MongoDB URI, never `localhost`.

## Deploy

1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. You'll get a URL like: `https://ramji-bakery-api.onrender.com`

## Update Vercel with Backend URL

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `NEXT_PUBLIC_API_URL=https://ram-ji-bakery23.onrender.com/api`
5. Redeploy (Settings → Deployments → Redeploy)

## Test Backend

Visit: `https://ramji-bakery-api.onrender.com/api/health`

You should see:
```json
{
  "ok": true,
  "service": "Ramji Bakery API",
  "dbConnected": true
}
```

## If Initial Deployment Fails:
1. Check "Logs" tab in Render
2. Look for error messages
3. Current common issue: MongoDB connection
   - Verify connection string is correct
   - Check MongoDB whitelist includes Render IP

