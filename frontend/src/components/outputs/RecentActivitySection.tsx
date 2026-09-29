"use client";

import { useState, useEffect } from "react";
import {
  HistoryRecord,
  getHistoryRecords,
  HISTORY_UPDATED_EVENT,
} from "@/lib/history";

interface RecentActivitySectionProps {
  onSelectRecord?: (recordId: string, record?: HistoryRecord) => void;
  onViewAllHistory?: () => void;
}

export default function RecentActivitySection({
  onSelectRecord,
  onViewAllHistory,
}: RecentActivitySectionProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setRecords(getHistoryRecords());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<HistoryRecord[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setRecords(customEvent.detail);
      } else {
        setRecords(getHistoryRecords());
      }
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const recentItems = records.slice(0, 3);

  return (
    <div id="recent-activity" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🕒</span>
          <span>Recent Activity</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            ({records.length} logged)
          </span>
        </h3>
        {onViewAllHistory && (
          <button
            type="button"
            onClick={onViewAllHistory}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full History →
          </button>
        )}
      </div>

      {recentItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          No recent document transformations. Upload your first document to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectRecord && onSelectRecord(item.id, item)}
              className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition cursor-pointer group"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.docTitle}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 border ${
                      item.status === "Verified"
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{item.timestamp}</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{item.language}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-wrap gap-1">
                  {item.formats.slice(0, 2).map((fmt, i) => (
                    <span
                      key={i}
                      className="text-[9px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                    >
                      {fmt}
                    </span>
                  ))}
                  {item.formats.length > 2 && (
                    <span className="text-[9px] text-slate-400">+{item.formats.length - 2}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  Open →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
