# Deploying Kartsique - Share with Friends

This guide will help you deploy your app so your friends can use it online.

## Quick Deploy Options

### Option 1: Deploy Everything (Recommended)

#### Frontend (Vite/React)
- **Vercel** (easiest): https://vercel.com
- **Netlify**: https://netlify.com

#### Signaling Server (Node.js)
- **Railway**: https://railway.app (free tier available)
- **Render**: https://render.com (free tier)
- **Fly.io**: https://fly.io (free tier)

#### Backend API (Python/FastAPI)
- **Railway**: https://railway.app
- **Render**: https://render.com

---

## Step-by-Step: Deploy to Vercel (Frontend)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy Frontend
```bash
vercel
```

Follow the prompts. Vercel will automatically detect your Vite app.

### 3. Set Environment Variables in Vercel Dashboard
Go to your project settings → Environment Variables:
```
VITE_API_URL=https://your-backend-url.com
VITE_SIGNALING_SERVER=https://your-signaling-server-url.com
```

### 4. Redeploy
After setting environment variables, redeploy your app.

---

## Step-by-Step: Deploy Signaling Server to Railway

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. Initialize Railway Project
```bash
railway init
railway add
```

### 3. Deploy
```bash
railway up
```

### 4. Get Your URL
Railway will give you a URL like: `https://your-project.railway.app`

### 5. Update CORS in server.js
Update the CORS origin to include your frontend URL:
```javascript
origin: ["https://your-frontend.vercel.app", "http://localhost:5173"],
```

---

## Step-by-Step: Deploy Backend API to Railway

### 1. Create a Railway Project
```bash
cd backend
railway init
```

### 2. Set Environment Variables
```bash
railway variables set SECRET_KEY=your-secret-key-here
```

### 3. Deploy
```bash
railway up
```

### 4. Get Your Backend URL
Railway will give you a URL like: `https://your-backend.railway.app`

---

## Environment Variables Summary

### Frontend (Vercel/Netlify)
```
VITE_API_URL=https://your-backend-url.railway.app
VITE_SIGNALING_SERVER=https://your-signaling-server.railway.app
```

### Signaling Server (Railway/Render)
No special environment variables needed (uses PORT from platform)

### Backend API (Railway/Render)
```
SECRET_KEY=your-random-secret-key-here
PORT=8000
```

---

## Update server.js for Production

Before deploying, update CORS in `server.js` to include your production URLs:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://your-app.vercel.app",
      "https://your-app.netlify.app",
      "http://localhost:5173" // Keep for local dev
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

---

## Testing After Deployment

1. Open your deployed frontend URL
2. Click "Join Debate"
3. Test video/audio
4. Share the link with friends!

---

## Free Hosting Options

- **Vercel**: Free for frontend hosting
- **Railway**: $5/month free credit (good for backend)
- **Render**: Free tier available
- **Netlify**: Free for static sites

---

## Quick Share Link

Once deployed, share your frontend URL with friends:
```
https://your-app.vercel.app
```

Anyone can now:
1. Visit your link
2. Click "Join Debate"
3. Start a video call!

