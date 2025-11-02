import React from "react";

export default function Hero({ openAuth, user, onJoinDebate }) {
  const handleJoinDebate = (e) => {
    e.preventDefault();
    if (onJoinDebate) {
      onJoinDebate();
    } else {
      // Fallback: scroll to active debates section
      const activeSection = document.querySelector('#active');
      if (activeSection) {
        activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleViewTimetable = (e) => {
    e.preventDefault();
    const timetableSection = document.querySelector('#timetable');
    if (timetableSection) {
      timetableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Aura */}
      <div className="hero-aura"></div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="grid md:grid-cols-2 items-center gap-12 lg:gap-16">
          {/* Copy */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full border border-brand-glow/30 text-brand-glow text-sm font-medium bg-brand-neon/5 [data-theme=light]:bg-blue-50 [data-theme=light]:border-blue-200 [data-theme=light]:text-blue-600">
              Democratizing Public Discourse
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight font-bold text-foreground-primary">
              Kartsique
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-foreground-secondary leading-relaxed">
              Where citizens speak and governments listen.
            </p>
            <p className="text-lg text-foreground-tertiary leading-relaxed">
              Join structured debates that shape Armenia's future.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleJoinDebate}
                className="btn btn-primary rounded-lg shadow-md px-6 py-3 text-base font-medium"
              >
                Join Debate
              </button>
              <button
                onClick={handleViewTimetable}
                className="btn btn-outline rounded-lg px-6 py-3 text-base font-medium border-2"
              >
                View Timetable
              </button>
              {!user && (
                <button
                  onClick={openAuth}
                  className="btn btn-ghost rounded-lg px-6 py-3 text-base font-medium border border-white/20 [data-theme=light]:border-gray-300 [data-theme=light]:bg-gray-50"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-brand-glow">2.4K+</div>
                <div className="text-sm text-foreground-tertiary mt-1">Active Participants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-glow">50+</div>
                <div className="text-sm text-foreground-tertiary mt-1">Live Debates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-glow">12</div>
                <div className="text-sm text-foreground-tertiary mt-1">Topics Covered</div>
              </div>
            </div>
          </div>

          {/* Futuristic illustration */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 [data-theme=dark]:bg-white/5 [data-theme=dark]:border-white/10">
              <svg viewBox="0 0 680 440" className="w-full h-full">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#61eaff" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity="1"/>
                  </linearGradient>
                </defs>

                {/* Waves - 3 curved lines */}
                <g fill="none" stroke="url(#g1)" strokeWidth="2.5" opacity="0.8">
                  <path d="M40,120 C240,40 440,60 640,120" />
                  <path d="M40,200 C240,140 440,160 640,200" />
                  <path d="M40,280 C240,240 440,260 640,280" />
                </g>

                {/* Nodes - 7 dots with bars underneath */}
                {[60, 150, 250, 380, 470, 570, 640].map((x, i) => {
                  const yBase = i % 2 === 0 ? 110 : 190;
                  const y = i === 6 ? 270 : yBase; // Last dot on third line
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="14" fill="#61eaff" opacity="0.95"/>
                      <rect x={x-20} y={y+22} width="40" height="8" rx="4" fill="#6c63ff" opacity="0.8"/>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="mt-4 text-sm text-foreground-tertiary text-center">
              Abstract network of citizens connected by structured debate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
