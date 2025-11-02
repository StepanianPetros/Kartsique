# Sharing Your App - Quick Guide

## Local Network Sharing (Same WiFi)

### For Frontend:
1. Find your local IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Or
   ipconfig getifaddr en0
   ```

2. Update Vite config to allow network access:
   ```bash
   npm run dev -- --host
   ```

3. Share this URL with friends on same WiFi:
   ```
   http://YOUR_IP:5173
   ```
   Example: `http://192.168.1.100:5173`

### For Signaling Server:
The server.js needs to be accessible. For local testing:
- Use `ngrok` to create a public tunnel:
  ```bash
  npx ngrok http 3001
  ```
- Use the ngrok URL in your frontend

---

## Production Deployment (Share with Anyone)

### Easiest Method: Use Vercel + Railway

1. **Deploy Frontend** (5 minutes):
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repo (or drag & drop)
   - Add environment variables:
     - `VITE_SIGNALING_SERVER` = your Railway URL
     - `VITE_API_URL` = your backend URL
   - Deploy!

2. **Deploy Signaling Server** (5 minutes):
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repo
   - Add `server.js` as entry point
   - Railway will auto-deploy

3. **Share the Link**:
   ```
   https://your-app.vercel.app
   ```

---

## Quick Deploy Script

Create a `deploy.sh` script:

```bash
#!/bin/bash
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployed!"
echo "Share this link: https://your-app.vercel.app"
```

---

## Troubleshooting

**Friends can't access?**
- Make sure the signaling server is deployed and running
- Check that environment variables are set correctly
- Verify CORS settings include your frontend URL

**Connection errors?**
- Ensure signaling server URL is publicly accessible
- Check that `VITE_SIGNALING_SERVER` is set correctly
- Test the signaling server URL in a browser

---

## One-Click Deploy Buttons

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

