import React from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Clock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Users = (props) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 20a6 6 0 0116 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function ActiveDebates({ debates = [], onJoinDebate, user, onJoinDebateModal, onRequireAuth }) {
  const navigate = useNavigate();

  const handleJoinDebate = (topic) => {
    // Check if user is signed in
    if (!user) {
      // Show auth modal if user is not signed in
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    // Generate unique debate call ID
    const debateCallId = uuidv4();
    
    // Use modal if callback provided, otherwise navigate to route
    if (onJoinDebateModal) {
      onJoinDebateModal(topic, debateCallId);
    } else {
      // Navigate to debate call page (authentication required)
      navigate(`/debate/${debateCallId}`);
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground-primary">Active Debates</h2>
        <p className="text-foreground-tertiary mt-2 text-lg">Jump into a live room or see what is starting soon.</p>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {debates.slice(0, 4).map((d, idx) => (
          <article
            key={idx}
            className="card hover:shadow-glow group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground-primary text-lg leading-tight pr-2">{d.topic}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                d.status === "Live Now"
                  ? "bg-red-500/20 text-red-300 border border-red-400/30 animate-pulse"
                  : "bg-amber-500/20 text-amber-200 border border-amber-300/30"
              }`}>
                {d.status === "Live Now" && "● "}
                {d.status}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm text-foreground-tertiary">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-glow" /> 
                <span className="font-medium">{d.time}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-glow" /> 
                <span className="font-medium">{d.participants} participants</span>
              </span>
            </div>

            <button 
              onClick={() => handleJoinDebate(d.topic)}
              className="mt-6 w-full btn btn-primary rounded-xl shadow-glow group-hover:scale-[1.02] transition-transform"
            >
              Join Debate
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
