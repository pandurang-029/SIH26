"use client";

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tabName: string) => void;
}

export default function Sidebar({ activeTab = "Dashboard", onSelectTab }: SidebarProps) {
  const navItems = [
    { name: "Dashboard", id: "Dashboard", icon: "📊", badge: null },
    { name: "New Transformation", id: "New Transformation", icon: "✨", badge: "AI" },
    { name: "Documents", id: "Documents", icon: "📁", badge: null },
    { name: "Generated Outputs", id: "Generated Outputs", icon: "📄", badge: null },
    { name: "Templates", id: "Templates", icon: "🧩", badge: null },
    { name: "History", id: "History", icon: "🕒", badge: null },
    { name: "Settings", id: "Settings", icon: "⚙️", badge: null },
  ];

  const handleNavClick = (tabName: string) => {
    if (onSelectTab) {
      onSelectTab(tabName);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside className="w-full lg:w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 shrink-0 p-4 transition-colors">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2.5 hidden lg:block">
        Workspace Navigation
      </div>
      <nav aria-label="Main Navigation">
        <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {navItems.map((item) => {
            const isActive = item.name === activeTab;
            return (
              <li key={item.name} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/70 font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
