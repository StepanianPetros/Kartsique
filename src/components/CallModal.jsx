import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

export default function CallModal({ open, onClose, theme = "dark", topic = "Debate Room", user = null }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const [myPeerId, setMyPeerId] = useState(null);
  const [inputPeerId, setInputPeerId] = useState("");
  const [showPeerInput, setShowPeerInput] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const localStream = useRef(null);
  const connections = useRef([]); // Store all peer connections

  const ROOM_ID = "kartsique-room";
  const PEER_STORAGE_KEY = `peer-room-${ROOM_ID}`;

  // Check if user is authenticated before initializing call
  useEffect(() => {
    if (!open) return;
    
    // If user is not authenticated, close the modal
    if (!user) {
      console.warn("❌ User not authenticated, closing call modal");
      onClose();
      return;
    }
  }, [open, user, onClose]);

  // Initialize peer and get media stream
  useEffect(() => {
    if (!open || !user) return;

    let peer = null;
    let stream = null;

    const initializeCall = async () => {
      try {
        // Request camera and microphone access
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStream.current = stream;

        // Set local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerJS
        peer = new Peer({
          host: "0.peerjs.com",
          port: 443,
          path: "/",
          secure: true,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        peer.on("open", (id) => {
          console.log("✅ Peer connected with ID:", id);
          peerInstance.current = peer;
          setMyPeerId(id);
          
          // Store our peer ID in localStorage for room discovery
          const roomPeers = JSON.parse(localStorage.getItem(PEER_STORAGE_KEY) || "[]");
          if (!roomPeers.includes(id)) {
            roomPeers.push(id);
            localStorage.setItem(PEER_STORAGE_KEY, JSON.stringify(roomPeers));
          }
          
          // Try to connect to existing peers in the room
          joinRoom(id);
          
          // Clean up old peer IDs (older than 5 minutes)
          const cleanup = () => {
            const peers = JSON.parse(localStorage.getItem(PEER_STORAGE_KEY) || "[]");
            localStorage.setItem(PEER_STORAGE_KEY, JSON.stringify(peers.filter(p => p !== id).concat(id)));
          };
          setTimeout(cleanup, 1000);
        });

        peer.on("error", (err) => {
          console.error("❌ Peer error:", err);
          setError(`Connection error: ${err.message}`);
        });

        // Handle incoming calls
        peer.on("call", (call) => {
          console.log("📞 Incoming call from:", call.peer);
          setRemotePeerId(call.peer);
          
          // Answer the call with our stream
          call.answer(stream);
          
          // Handle remote stream
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setIsConnected(true);
          });

          call.on("close", () => {
            console.log("📴 Call ended");
            setIsConnected(false);
            setRemotePeerId(null);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          });

          call.on("error", (err) => {
            console.error("❌ Call error:", err);
          });

          connections.current.push(call);
        });

      } catch (err) {
        console.error("❌ Error accessing media devices:", err);
        setError(
          err.name === "NotAllowedError"
            ? "Camera and microphone access denied. Please allow access and try again."
            : `Failed to access camera/microphone: ${err.message}`
        );
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [open, user]);

  const joinRoom = (myPeerId) => {
    if (!peerInstance.current) return;

    console.log("🔍 Looking for peers in room:", ROOM_ID);
    
    // Try to find other peers in the room from localStorage
    // Note: This only works for peers in the same browser. For different devices,
    // users need to manually share peer IDs.
    const roomPeers = JSON.parse(localStorage.getItem(PEER_STORAGE_KEY) || "[]");
    const otherPeers = roomPeers.filter((id) => id !== myPeerId);
    
    if (otherPeers.length > 0) {
      // Connect to the first available peer
      const targetPeerId = otherPeers[0];
      console.log("📞 Connecting to peer:", targetPeerId);
      callPeer(targetPeerId);
    } else {
      console.log("⏳ No other peers in room, waiting for connections...");
      // Try to auto-connect periodically (only works for same browser)
      const intervalId = setInterval(() => {
        const peers = JSON.parse(localStorage.getItem(PEER_STORAGE_KEY) || "[]");
        const others = peers.filter((id) => id !== myPeerId);
        if (others.length > 0 && !isConnected) {
          callPeer(others[0]);
          clearInterval(intervalId);
        }
      }, 2000);
      
      // Cleanup interval after 30 seconds
      setTimeout(() => clearInterval(intervalId), 30000);
    }
  };

  const copyPeerId = async () => {
    if (myPeerId) {
      try {
        await navigator.clipboard.writeText(myPeerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        // Fallback: select the text
        const textarea = document.createElement("textarea");
        textarea.value = myPeerId;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };
  
  const handleConnectPeer = () => {
    if (inputPeerId.trim() && peerInstance.current) {
      callPeer(inputPeerId.trim());
      setInputPeerId("");
      setShowPeerInput(false);
    }
  };

  const callPeer = (peerId) => {
    if (!peerInstance.current || !localStream.current) return;

    const call = peerInstance.current.call(peerId, localStream.current);
    setRemotePeerId(peerId);

    call.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setIsConnected(true);
    });

    call.on("close", () => {
      console.log("📴 Call ended");
      setIsConnected(false);
      setRemotePeerId(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    call.on("error", (err) => {
      console.error("❌ Call error:", err);
      setError(`Call failed: ${err.message}`);
    });

    connections.current.push(call);
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleLeave = () => {
    // Remove our peer ID from room
    if (myPeerId) {
      const roomPeers = JSON.parse(localStorage.getItem(PEER_STORAGE_KEY) || "[]");
      const updatedPeers = roomPeers.filter((id) => id !== myPeerId);
      localStorage.setItem(PEER_STORAGE_KEY, JSON.stringify(updatedPeers));
    }

    // Stop all tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    // Close all connections
    connections.current.forEach((conn) => {
      if (conn.close) conn.close();
    });
    connections.current = [];

    // Destroy peer instance
    if (peerInstance.current) {
      peerInstance.current.destroy();
      peerInstance.current = null;
    }

    // Clear video refs
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset state
    setIsConnected(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
    setError(null);
    setRemotePeerId(null);
    setMyPeerId(null);
    setInputPeerId("");
    setShowPeerInput(false);

    // Close modal
    onClose();
  };

  // Cleanup on unmount or when modal closes
  useEffect(() => {
    if (!open && peerInstance.current) {
      // Only cleanup if modal is closing and we have an active connection
      const cleanup = () => {
        if (myPeerId) {
          const roomPeers = JSON.parse(localStorage.getItem(PEER_STORAGE_KEY) || "[]");
          const updatedPeers = roomPeers.filter((id) => id !== myPeerId);
          localStorage.setItem(PEER_STORAGE_KEY, JSON.stringify(updatedPeers));
        }
        if (localStream.current) {
          localStream.current.getTracks().forEach((track) => track.stop());
        }
        connections.current.forEach((conn) => {
          if (conn.close) conn.close();
        });
        if (peerInstance.current) {
          peerInstance.current.destroy();
        }
      };
      cleanup();
    }
  }, [open, myPeerId]);

  if (!open || !user) return null;

  return (
    <div className="sticky top-[64px] z-40 w-full glass border-b border-white/10 backdrop-blur-md bg-white/80 [data-theme=dark]:bg-black/80 [data-theme=dark]:backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Header with topic and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-foreground-primary">
              {topic}
            </h3>
            <div className={`flex items-center gap-1.5 text-xs ${
              isConnected ? "text-green-400" : "text-amber-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-amber-400"
              }`}></span>
              <span>{isConnected ? "Connected" : myPeerId ? "Waiting..." : "Connecting..."}</span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="rounded-lg px-2 py-1 text-foreground-tertiary hover:bg-white/10 hover:text-foreground-primary transition-colors"
            aria-label="Leave call"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-2 p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Compact horizontal layout */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Video previews */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Local video */}
            <div className="relative rounded-lg overflow-hidden bg-black/20 w-24 h-16 shrink-0">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-black/70 text-white text-[10px]">
                You {isMuted && "🔇"}
              </div>
            </div>

            {/* Remote video */}
            <div className="relative rounded-lg overflow-hidden bg-black/20 w-24 h-16 shrink-0">
              {remotePeerId && isConnected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                  <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-black/70 text-white text-[10px]">
                Peer
              </div>
            </div>
          </div>

          {/* Peer ID section (collapsible) */}
          {!isConnected && myPeerId && (
            <div className="flex items-center gap-2">
              {!showPeerInput ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10">
                    <span className="text-xs text-foreground-tertiary">ID:</span>
                    <code className="text-xs font-mono text-foreground-secondary">{myPeerId.slice(0, 8)}...</code>
                    <button
                      onClick={copyPeerId}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${
                        copied
                          ? "bg-green-500/20 text-green-400"
                          : "bg-brand-neon/20 text-brand-glow hover:bg-brand-neon/30"
                      }`}
                      title="Copy full ID"
                    >
                      {copied ? "✓" : "📋"}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowPeerInput(true)}
                    className="btn btn-outline rounded-lg px-3 py-1.5 text-xs"
                  >
                    Connect
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputPeerId}
                    onChange={(e) => setInputPeerId(e.target.value)}
                    placeholder="Peer ID..."
                    className="w-32 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground-primary placeholder-foreground-tertiary focus:outline-none focus:border-brand-glow/50 text-xs font-mono"
                    onKeyPress={(e) => e.key === "Enter" && handleConnectPeer()}
                    autoFocus
                  />
                  <button
                    onClick={handleConnectPeer}
                    disabled={!inputPeerId.trim()}
                    className="btn btn-primary rounded-lg px-3 py-1.5 text-xs shadow-glow disabled:opacity-50"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => {
                      setShowPeerInput(false);
                      setInputPeerId("");
                    }}
                    className="btn btn-ghost rounded-lg px-2 py-1.5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleMute}
              className={`btn rounded-lg px-3 py-1.5 text-xs transition-all ${
                isMuted
                  ? "bg-red-500/20 text-red-300 border border-red-400/30"
                  : "btn-outline"
              }`}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`btn rounded-lg px-3 py-1.5 text-xs transition-all ${
                !isVideoEnabled
                  ? "bg-red-500/20 text-red-300 border border-red-400/30"
                  : "btn-outline"
              }`}
              aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
              title={isVideoEnabled ? "Turn off video" : "Turn on video"}
            >
              {isVideoEnabled ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>

            <button
              onClick={handleLeave}
              className="btn btn-primary rounded-lg px-3 py-1.5 text-xs shadow-glow"
              title="Leave call"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

