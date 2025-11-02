import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || "http://localhost:3001";

export default function DebateCall({ debateCallId: propDebateCallId, onClose, user }) {
  // Get debateCallId from route params if in route context
  const { debateCallId: paramDebateCallId } = useParams();
  const navigate = useNavigate();
  
  // Use prop if provided (modal mode), otherwise use route param
  const debateCallId = propDebateCallId || paramDebateCallId;
  
  // Don't initialize if no debateCallId
  if (!debateCallId) {
    return null;
  }

  // Check if user is authenticated (for route mode only, modal mode handles it differently)
  useEffect(() => {
    if (!onClose && !user) {
      // User is not authenticated and trying to access via route
      navigate("/");
    }
  }, [user, onClose, navigate]);
  
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    initializeCall();

    return () => {
      cleanup();
    };
  }, [debateCallId]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to signaling server
      socketRef.current = io(SIGNALING_SERVER, {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to signaling server");
        socketRef.current.emit("join-debate", debateCallId);
      });

      socketRef.current.on("joined-debate", ({ memberCount }) => {
        console.log(`✅ Joined debate room. Members: ${memberCount}`);
        setIsConnected(true);
      });

      socketRef.current.on("existing-users", (userIds) => {
        console.log("👥 Existing users:", userIds);
        userIds.forEach((userId) => {
          createPeerConnection(userId, true);
        });
      });

      socketRef.current.on("user-joined", (userId) => {
        console.log("👋 User joined:", userId);
        createPeerConnection(userId, false);
        setRemoteUsers((prev) => [...prev, userId]);
      });

      socketRef.current.on("user-left", (userId) => {
        console.log("👋 User left:", userId);
        handleUserLeft(userId);
      });

      socketRef.current.on("offer", async ({ offer, from }) => {
        console.log("📥 Received offer from:", from);
        await handleOffer(offer, from);
      });

      socketRef.current.on("answer", async ({ answer, from }) => {
        console.log("📥 Received answer from:", from);
        await handleAnswer(answer, from);
      });

      socketRef.current.on("ice-candidate", async ({ candidate, from }) => {
        console.log("🧊 Received ICE candidate from:", from);
        await handleIceCandidate(candidate, from);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
        setError(
          `Failed to connect to signaling server at ${SIGNALING_SERVER}. ` +
          `Make sure the server is running: npm run server`
        );
      });

      socketRef.current.on("disconnect", (reason) => {
        console.error("❌ Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          setError("Disconnected from server. Please refresh the page.");
        }
      });

    } catch (err) {
      console.error("❌ Error initializing call:", err);
      setError(
        err.name === "NotAllowedError"
          ? "Camera and microphone access denied. Please allow access and try again."
          : `Failed to start call: ${err.message}`
      );
    }
  };

  const createPeerConnection = (userId, isInitiator) => {
    if (peerConnectionsRef.current[userId]) {
      return; // Already exists
    }

    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionsRef.current[userId] = pc;

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("🎥 Received remote stream from:", userId);
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          to: userId,
          debateCallId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        handleUserLeft(userId);
      }
    };

    // Create offer if initiator
    if (isInitiator) {
      pc.createOffer()
        .then((offer) => {
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          socketRef.current.emit("offer", {
            offer: pc.localDescription,
            to: userId,
            debateCallId,
          });
        })
        .catch((err) => console.error("Error creating offer:", err));
    }
  };

  const handleOffer = async (offer, from) => {
    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionsRef.current[from] = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Set remote description
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Create answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit("answer", {
      answer: pc.localDescription,
      to: from,
      debateCallId,
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("🎥 Received remote stream from:", from);
      if (remoteVideoRefs.current[from]) {
        remoteVideoRefs.current[from].srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          to: from,
          debateCallId,
        });
      }
    };
  };

  const handleAnswer = async (answer, from) => {
    const pc = peerConnectionsRef.current[from];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (candidate, from) => {
    const pc = peerConnectionsRef.current[from];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleUserLeft = (userId) => {
    const pc = peerConnectionsRef.current[userId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[userId];
    }
    if (remoteVideoRefs.current[userId]) {
      remoteVideoRefs.current[userId].srcObject = null;
      delete remoteVideoRefs.current[userId];
    }
    setRemoteUsers((prev) => prev.filter((id) => id !== userId));
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    cleanup();
    if (onClose) {
      // Modal mode - close modal
      onClose();
    } else {
      // Route mode - navigate home
      navigate("/");
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/debate/${debateCallId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const cleanup = () => {
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current = {};

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit("leave-debate", debateCallId);
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clear video refs
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    Object.values(remoteVideoRefs.current).forEach((video) => {
      if (video) video.srcObject = null;
    });
  };

  // Get theme from localStorage or default
  const theme = localStorage.getItem("theme") || "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          theme === "light" ? "bg-black/40" : "bg-black/70"
        }`}
        onClick={handleEndCall}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative glass w-full max-w-6xl rounded-2xl p-6 border shadow-2xl bg-gray-900 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">
              Debate Call
            </h3>
            <div className={`flex items-center gap-2 text-sm ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}></span>
              <span>{isConnected ? "Connected" : "Not Connected"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyLink}
              className="btn bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm transition-all"
            >
              Copy Link
            </button>
            <button
              onClick={handleEndCall}
              className="rounded-lg px-3 py-1.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Connection Error</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Local video */}
          <div className="relative rounded-xl overflow-hidden bg-black/20 aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
              You {isMuted && "🔇"}
            </div>
          </div>

          {/* Remote videos */}
          {remoteUsers.map((userId, index) => (
            <div
              key={userId}
              className="relative rounded-xl overflow-hidden bg-black/20 aspect-video"
            >
              <video
                ref={(el) => {
                  remoteVideoRefs.current[userId] = el;
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
                Participant {index + 1}
              </div>
            </div>
          ))}

          {/* Waiting state for remote */}
          {remoteUsers.length === 0 && (
            <div className="relative rounded-xl overflow-hidden bg-black/20 aspect-video">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-white/70">
                    Waiting for other participants...
                  </p>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-xs">
                Participant
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`btn rounded-xl px-6 py-3 transition-all ${
              isMuted
                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                : "btn-outline"
            }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
            <span className="ml-2">{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            onClick={toggleVideo}
            className={`btn rounded-xl px-6 py-3 transition-all ${
              !isVideoEnabled
                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                : "btn-outline"
            }`}
            aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
          >
            {isVideoEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
            <span className="ml-2">{isVideoEnabled ? "Stop Video" : "Start Video"}</span>
          </button>

          <button
            onClick={handleEndCall}
            className="btn btn-primary rounded-xl px-6 py-3 shadow-glow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="ml-2">Leave Call</span>
          </button>
        </div>

        {/* Connection status */}
        <div className="mt-4 text-center">
          <div className={`inline-flex items-center gap-2 text-xs ${
            isConnected ? "text-green-400" : "text-red-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}></span>
            {isConnected ? "Connected" : "Not Connected"}
          </div>
        </div>
      </div>
    </div>
  );
}

