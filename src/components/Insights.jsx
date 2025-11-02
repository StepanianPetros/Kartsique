import React, { useState } from "react";

export default function Insights() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const bars = [
    { label: "Jobs", value: 86 },
    { label: "Healthcare", value: 72 },
    { label: "Education", value: 65 },
    { label: "Transport", value: 50 },
    { label: "Digital Rights", value: 38 },
  ];

  const trendingTopics = [
    { 
      id: 1, 
      title: "Employment & Wages", 
      mentions: 2450, 
      change: +15.3, 
      icon: "💼",
      category: "Economic",
      description: "Discussions about minimum wage, job opportunities, and employment policies"
    },
    { 
      id: 2, 
      title: "Healthcare Access", 
      mentions: 1890, 
      change: +8.7, 
      icon: "🏥",
      category: "Social",
      description: "Affordable healthcare, medical facilities, and health insurance coverage"
    },
    { 
      id: 3, 
      title: "Digital Privacy", 
      mentions: 1650, 
      change: +22.1, 
      icon: "🔒",
      category: "Technology",
      description: "Data protection, online privacy rights, and digital surveillance"
    },
    { 
      id: 4, 
      title: "Education Reform", 
      mentions: 1420, 
      change: +5.2, 
      icon: "📚",
      category: "Education",
      description: "School curriculum, teacher salaries, and educational infrastructure"
    },
    { 
      id: 5, 
      title: "Public Transport", 
      mentions: 1180, 
      change: -2.1, 
      icon: "🚌",
      category: "Infrastructure",
      description: "Public transportation quality, routes, and accessibility"
    },
    { 
      id: 6, 
      title: "Youth Programs", 
      mentions: 980, 
      change: +12.4, 
      icon: "🎯",
      category: "Social",
      description: "Youth employment initiatives, education support, and community programs"
    },
    { 
      id: 7, 
      title: "Housing Affordability", 
      mentions: 850, 
      change: +18.9, 
      icon: "🏠",
      category: "Economic",
      description: "Housing prices, rent control, and affordable housing policies"
    },
    { 
      id: 8, 
      title: "Environmental Policy", 
      mentions: 720, 
      change: +9.6, 
      icon: "🌱",
      category: "Environment",
      description: "Climate action, pollution control, and green energy initiatives"
    },
  ];

  const filteredTopics = trendingTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicClick = (topic) => {
    setSelectedTopic(selectedTopic?.id === topic.id ? null : topic);
  };

  return (
    <section>
      <div className="mb-8">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground-primary">AI Insights Preview</h2>
        <p className="text-foreground-tertiary mt-2 text-lg">
          Kartsique uses AI to highlight what citizens care about most.
        </p>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Bars */}
        <div className="card">
          <h3 className="font-semibold text-xl mb-6 text-foreground-primary">Top Mentioned Issues</h3>
          <div className="space-y-4">
            {bars.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground-secondary">{b.label}</span>
                  <span className="font-bold text-brand-glow">{b.value}%</span>
                </div>
                <div className="h-4 rounded-full bg-white/10 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${b.value}%`,
                      background:
                        "linear-gradient(90deg, rgba(97,234,255,1) 0%, rgba(108,99,255,1) 100%)",
                      boxShadow: "0 0 14px rgba(97,234,255,.6)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl text-foreground-primary">Trending Topics</h3>
            <div className="text-xs text-foreground-tertiary">Live updates</div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground-primary placeholder-foreground-tertiary focus:outline-none focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/30 transition-colors [data-theme=light]:bg-white/80 [data-theme=light]:border-gray-300 [data-theme=light]:text-gray-900"
            />
          </div>

          {/* Topics List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedTopic?.id === topic.id
                    ? "bg-brand-neon/10 border-brand-glow/50 shadow-lg shadow-brand-glow/20"
                    : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl mt-0.5">{topic.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground-primary text-sm">{topic.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-neon/10 text-brand-glow border border-brand-glow/20">
                          {topic.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-foreground-tertiary mb-2">
                        <span>{topic.mentions.toLocaleString()} mentions</span>
                        <span className={`flex items-center gap-1 font-medium ${
                          topic.change > 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          {topic.change > 0 ? "↑" : "↓"} {Math.abs(topic.change)}%
                        </span>
                      </div>
                      {selectedTopic?.id === topic.id && (
                        <p className="text-xs text-foreground-secondary mt-2 leading-relaxed">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicClick(topic);
                    }}
                    className="text-brand-glow hover:text-brand-glow/80 transition-colors shrink-0 [data-theme=light]:text-blue-600 [data-theme=light]:hover:text-blue-700"
                  >
                    {selectedTopic?.id === topic.id ? "▼" : "▶"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-8 text-foreground-tertiary text-sm">
              No topics found matching "{searchQuery}"
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
            <button 
              onClick={() => {
                // Scroll to active debates section
                const activeSection = document.querySelector('#active');
                if (activeSection) {
                  activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-brand-neon/10 text-brand-glow border border-brand-glow/20 hover:bg-brand-neon/20 transition-colors [data-theme=light]:bg-blue-50 [data-theme=light]:text-blue-600 [data-theme=light]:border-blue-200 [data-theme=light]:hover:bg-blue-100"
            >
              View All Topics
            </button>
            <button 
              onClick={() => {
                // Show export notification (in real app, this would trigger data export)
                alert('Exporting data... In a full implementation, this would download the insights data.');
              }}
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 text-foreground-secondary border border-white/10 hover:bg-white/8 transition-colors [data-theme=light]:bg-gray-100 [data-theme=light]:text-gray-700 [data-theme=light]:border-gray-300 [data-theme=light]:hover:bg-gray-200"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
