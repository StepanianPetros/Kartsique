import React from "react";

export default function Timetable({ items = [] }) {
  return (
    <section>
      <div className="mb-8">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground-primary">Debate Timetable</h2>
        <p className="text-foreground-tertiary mt-2 text-lg">Plan your participation across topics and age groups.</p>
      </div>

      <div className="mt-6">
        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl overflow-hidden glass border">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr className="text-sm text-foreground-tertiary uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Time</th>
                <th className="py-4 px-6 font-semibold">Topic</th>
                <th className="py-4 px-6 font-semibold">Age Group</th>
                <th className="py-4 px-6 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={idx} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-medium text-foreground-primary">{row.date}</td>
                  <td className="py-4 px-6 text-brand-glow font-medium">{row.time}</td>
                  <td className="py-4 px-6 font-medium text-foreground-primary">{row.topic}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-neon/10 text-brand-glow text-sm border border-brand-glow/20">
                      {row.age}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => {
                        // Show reminder set notification
                        alert(`Reminder set for ${row.topic} on ${row.date} at ${row.time}`);
                      }}
                      className="btn btn-outline rounded-lg text-sm hover:scale-105 transition-transform"
                    >
                      Set Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {items.map((row, idx) => (
            <div key={idx} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="font-semibold text-lg pr-2 text-foreground-primary">{row.topic}</div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-brand-neon/10 text-brand-glow text-xs border border-brand-glow/20 shrink-0">
                  {row.age}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-foreground-tertiary">
                <span className="font-medium">{row.date}</span>
                <span>•</span>
                <span className="text-brand-glow font-medium">{row.time}</span>
              </div>
              <button 
                onClick={() => {
                  // Show reminder set notification
                  alert(`Reminder set for ${row.topic} on ${row.date} at ${row.time}`);
                }}
                className="mt-4 w-full btn btn-outline rounded-lg hover:scale-105 transition-transform"
              >
                Set Reminder
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
