import { useState, useEffect } from "react";
import {
  HistoryRecord,
  getHistoryRecords,
  clearHistoryRecords,
  HISTORY_UPDATED_EVENT,
} from "@/lib/history";

interface HistorySectionProps {
  onSelectRecord?: (recordId: string, record?: HistoryRecord) => void;
}

export default function HistorySection({ onSelectRecord }: HistorySectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
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

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your transformation history?")) {
      clearHistoryRecords();
      setRecords([]);
    }
  };

  const filteredHistory = records.filter((item) => {
    const matchesSearch =
      item.docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.language.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/40">
            Audit Trail & Transformation Log
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-2">
            <span>🕒</span>
            <span>Transformation History</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredHistory.length} record{filteredHistory.length === 1 ? "" : "s"})
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit generated outputs, provenance verification scores, and targeted configurations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search transformations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Reviewed">Reviewed</option>
          </select>
          {records.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
              title="Clear all stored history"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.docTitle}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    item.status === "Verified"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {item.status} ({item.qualityScore}%)
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                <span>Timestamp: <strong>{item.timestamp}</strong></span>
                <span>Language: <strong className="text-blue-600 dark:text-blue-400">{item.language}</strong></span>
                <span>Audience: <strong>{item.audience}</strong></span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.formats.map((fmt, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectRecord && onSelectRecord(item.id, item)}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition shadow-sm"
            >
              View Record ➔
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
