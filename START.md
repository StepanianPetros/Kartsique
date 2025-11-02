# Quick Start Guide

## To Run the Application

You need **TWO terminal windows**:

### Terminal 1 - Start the Signaling Server
```bash
npm run server
```
You should see: `🚀 Signaling server running on http://localhost:3001`

### Terminal 2 - Start the Frontend
```bash
npm run dev
```
You should see: `Local: http://localhost:5173`

## If You See "Failed to connect to signaling server"

1. ✅ Make sure the signaling server is running (Terminal 1)
2. ✅ Check that it's running on port 3001
3. ✅ Make sure no firewall is blocking port 3001
4. ✅ Try refreshing the page

## Troubleshooting

**Port already in use?**
- Change the port in `server.js`: `const PORT = 3002;`
- Or kill the process: `lsof -ti:3001 | xargs kill`

**Server won't start?**
- Make sure you've installed dependencies: `npm install`
- Check Node.js version: `node --version` (should be 14+)

