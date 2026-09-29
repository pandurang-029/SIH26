"use client";

import { useState } from "react";
import { CommonContentRepresentation } from "@/lib/types";

interface AnalysisWorkspaceCardProps {
  analysisData: CommonContentRepresentation;
}

export default function AnalysisWorkspaceCard({
  analysisData,
}: AnalysisWorkspaceCardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "findings" | "risks" | "entities" | "statistics" | "sources"
  >("overview");
  const [expandedExcerptIndex, setExpandedExcerptIndex] = useState<number | null>(null);

  const {
    document_title,
    document_topic,
    executive_context,
    key_facts,
    entities,
    events,
    key_findings,
    risks,
    recommendations,
    important_statistics,
    source_references,
  } = analysisData;

  const toggleExcerpt = (idx: number) => {
    setExpandedExcerptIndex(expandedExcerptIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              AI Grounded Analysis
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Common Content Representation</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🧠</span>
            <span>Content Intelligence Workspace</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span>Target Schema: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Normalized Knowledge Model</strong></span>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Document Title</span>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{document_title || "Untitled Document"}</h4>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Topic</span>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/60 mt-0.5">
              {document_topic || "General Security & Policy"}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Executive Context</span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
            {executive_context || "No executive summary context provided."}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Overview & Facts ({key_facts?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("findings")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "findings"
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Key Findings ({key_findings?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("risks")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "risks"
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Risks & Recommendations ({risks?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("entities")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "entities"
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Entities & Events ({entities?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("statistics")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "statistics"
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Statistics ({important_statistics?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === "sources"
              ? "bg-blue-600 text-white font-bold shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Source Grounding ({source_references?.length || 0})
        </button>
      </div>

      {/* Tab 1: Overview & Facts */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Core Extracted Facts</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{key_facts.length} items</span>
          </h4>
          {key_facts.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No key facts recorded.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {key_facts.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{item.fact}</p>
                  {item.source_page && (
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800/60">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800/40">
                        Source: Page {item.source_page}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Key Findings */}
      {activeTab === "findings" && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Analytical Findings</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{key_findings.length} items</span>
          </h4>
          {key_findings.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No key findings recorded.</p>
          ) : (
            <div className="space-y-3">
              {key_findings.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-blue-600 dark:text-blue-300">Finding #{idx + 1}</span>
                    {item.importance && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.importance} Importance
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{item.finding}</p>
                  {item.source_page && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-end">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-[11px] border border-blue-200 dark:border-blue-800/40">
                        Source: Page {item.source_page}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Risks & Recommendations */}
      {activeTab === "risks" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risks Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>⚠️</span>
              <span>Identified Risks ({risks.length})</span>
            </h4>
            {risks.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No explicit risks documented.</p>
            ) : (
              risks.map((item, idx) => (
                <div key={idx} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">Risk #{idx + 1}</span>
                    {item.severity && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60">
                        {item.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{item.risk}</p>
                  {item.source_page && (
                    <span className="inline-block text-[10px] font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                      Source: Page {item.source_page}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Recommendations Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>💡</span>
              <span>Recommendations ({recommendations.length})</span>
            </h4>
            {recommendations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No explicit recommendations documented.</p>
            ) : (
              recommendations.map((item, idx) => (
                <div key={idx} className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Action #{idx + 1}</span>
                    {item.priority && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        Priority: {item.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{item.recommendation}</p>
                  {item.source_page && (
                    <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60">
                      Source: Page {item.source_page}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Entities & Events */}
      {activeTab === "entities" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Extracted Entities ({entities.length})</h4>
            {entities.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No named entities extracted.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {entities.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Type: <strong className="text-slate-700 dark:text-slate-300">{item.type}</strong></span>
                      {item.source_page && <span>Page {item.source_page}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Events & Chronology ({events.length})</h4>
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No key events extracted.</p>
            ) : (
              <div className="space-y-2">
                {events.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.description}</span>
                      {item.date && (
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {item.date}
                        </span>
                      )}
                    </div>
                    {item.source_page && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Source: Page {item.source_page}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Statistics */}
      {activeTab === "statistics" && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Numerical Data & Metrics ({important_statistics.length})</h4>
          {important_statistics.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No quantitative statistics extracted.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {important_statistics.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">{item.metric}</span>
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{item.value}</div>
                  {item.context && <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">{item.context}</p>}
                  {item.source_page && (
                    <span className="inline-block text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Source: Page {item.source_page}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Source Grounding */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Source Text Excerpts & Provenance</h4>
          {source_references.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No source references registered.</p>
          ) : (
            <div className="space-y-3">
              {source_references.map((item, idx) => {
                const isExcerptExpanded = expandedExcerptIndex === idx;
                return (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800/40">
                        Source: Page {item.page_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExcerpt(idx)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                      >
                        {isExcerptExpanded ? "Hide Excerpt ▲" : "View Excerpt ▼"}
                      </button>
                    </div>

                    {isExcerptExpanded && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        "{item.supporting_text}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
