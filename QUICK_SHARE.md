# Quick Share Guide - Share Your App with Friends! 🚀

## Option 1: Quick Local Share (Same WiFi) ⚡

### Step 1: Start Your Servers

**Terminal 1** - Signaling Server:
```bash
npm run server
```

**Terminal 2** - Frontend:
```bash
npm run dev -- --host
```

**Terminal 3** - Backend (if using auth):
```bash
cd backend
python main.py
```

### Step 2: Find Your IP Address

**Mac/Linux:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet "
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address
```

### Step 3: Share the URL

Share this with friends on the same WiFi:
```
http://YOUR_IP_ADDRESS:5173
```

Example: `http://192.168.1.100:5173`

### Step 4: Start Signaling Server with Public Access

Use **ngrok** to make the signaling server accessible:
```bash
npx ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update:
- Set `VITE_SIGNALING_SERVER` to the ngrok URL in your frontend
- Or update environment variable: `export VITE_SIGNALING_SERVER=https://abc123.ngrok.io`

---

## Option 2: Deploy Online (Share with Anyone) 🌐

### Easiest: Vercel + Railway (Free)

#### Frontend (Vercel) - 5 minutes:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add Environment Variables in Vercel Dashboard:
   - `VITE_SIGNALING_SERVER` = your Railway URL
   - `VITE_API_URL` = your backend URL

4. Get your public URL: `https://your-app.vercel.app`

#### Signaling Server (Railway) - 5 minutes:

1. Go to https://railway.app
2. Sign up/login (free tier available)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Set start command: `node server.js`
6. Railway will give you a URL automatically
7. Update CORS in `server.js` to include your Vercel URL

#### Share Your Link:
```
https://your-app.vercel.app
```

---

## Quick Setup Checklist

- [ ] Frontend deployed (Vercel)
- [ ] Signaling server deployed (Railway)
- [ ] Environment variables set
- [ ] CORS updated in server.js
- [ ] Test with a friend!

---

## Testing After Deploy

1. Open your public URL
2. Click "Join Debate"
3. Share the debate link with a friend
4. Both should see each other!

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Quick Deploy**: Use the scripts above!

