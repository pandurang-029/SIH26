export default function ResultsSection() {
  const placeholders = [
    { title: "Executive Summary", icon: "📋" },
    { title: "Advisory", icon: "📢" },
    { title: "Presentation", icon: "📊" },
    { title: "Social Media", icon: "📱" },
    { title: "Infographic", icon: "🖼️" },
  ];

  return (
    <div id="outputs-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>✨</span>
            <span>Generated Outputs</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View, download, or review generated multi-format content.
          </p>
        </div>
      </div>

      {/* Main Empty State Banner */}
      <div className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400 mx-auto text-2xl shadow-sm">
          📥
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No outputs generated yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Your transformed content will appear here after processing. Select a source document and click <strong className="text-slate-700 dark:text-slate-300 font-semibold">Generate Outputs</strong> to begin.
        </p>
      </div>

      {/* Placeholder Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {placeholders.map((item) => (
          <div
            key={item.title}
            className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 opacity-60 flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono italic">
              Awaiting transformation job...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
