# Full-Screen Debate Call Setup Guide

## Prerequisites
- Node.js installed
- Two devices (phone and laptop) on the same Wi-Fi network

## Setup Instructions

### 1. Start the Signaling Server

Open a terminal and run:
```bash
npm run server
```

The server will start on `http://localhost:3001`

### 2. Start the Frontend

Open another terminal and run:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Environment Variables (Optional)

Create a `.env` file in the root directory if you want to customize the signaling server URL:

```
VITE_SIGNALING_SERVER=http://localhost:3001
```

## Testing Multi-Device Calls

1. **Device 1 (Laptop)**:
   - Sign in to the website
   - Click "Join Debate" on any debate
   - You'll be redirected to `/debate/[UUID]`
   - Allow camera/microphone permissions

2. **Device 2 (Phone)**:
   - Sign in to the website
   - Enter the same URL (copy from Device 1 using "Copy Link" button)
   - Or click "Join Debate" on the same debate topic (will generate a new UUID - you need to use the same UUID)

3. **Both devices should now see each other's video/audio**

## Features

- ✅ Full-screen call mode
- ✅ Real-time WebRTC connection
- ✅ Socket.io signaling server
- ✅ Multi-device support
- ✅ Mute/unmute controls
- ✅ Video on/off controls
- ✅ Copy link functionality
- ✅ Responsive design (mobile & desktop)

## Troubleshooting

- **Can't connect**: Make sure both devices are on the same Wi-Fi network
- **No video**: Check browser permissions for camera/microphone
- **Connection failed**: Ensure the signaling server is running on port 3001
- **CORS errors**: Check that the server.js CORS settings match your frontend URL

