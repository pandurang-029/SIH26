"use client";

import { useState } from "react";
import { SocialMediaOutput, SocialMediaPost } from "@/lib/types";

interface SocialMediaOutputViewProps {
  documentId: string;
  data: SocialMediaOutput;
}

export default function SocialMediaOutputView({
  documentId,
  data,
}: SocialMediaOutputViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleCopyPost = (post: SocialMediaPost) => {
    const textToCopy = `${post.content}\n\n${post.hashtags.join(" ")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(post.post_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800/40">
            Social Media Artifact (LinkedIn & X)
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-1">{data.title}</h3>
        </div>

        {/* Disabled Export Button */}
        <div className="self-start sm:self-auto flex items-center gap-2">
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/60 font-semibold text-xs transition cursor-not-allowed flex items-center gap-2"
            title="Export coming later"
          >
            <span>Export coming later</span>
            <span className="text-slate-500">🔒</span>
          </button>
        </div>
      </div>

      {/* Campaign Hashtags */}
      {data.hashtags && data.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-slate-400 font-medium mr-1">Campaign Hashtags:</span>
          {data.hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-800/40 px-2.5 py-0.5 rounded-full"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Generated Social Posts & Threads ({data.posts?.length || 0})
        </h4>

        {data.posts && data.posts.length > 0 ? (
          data.posts.map((post) => {
            const isLinkedin = post.platform.toLowerCase().includes("linkedin");
            return (
              <div
                key={post.post_id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        isLinkedin
                          ? "bg-blue-950 text-blue-400 border border-blue-800/40"
                          : "bg-purple-950 text-purple-400 border border-purple-800/40"
                      }`}
                    >
                      {post.platform.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-slate-400">ID: {post.post_id}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPost(post)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    {copiedId === post.post_id ? (
                      <>
                        <span>Copied!</span>
                        <span>✓</span>
                      </>
                    ) : (
                      <>
                        <span>Copy Post</span>
                        <span>📋</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {post.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-sky-400 hover:underline">
                        {tag.startsWith("#") ? tag : `#${tag}`}{" "}
                      </span>
                    ))}
                  </div>
                )}

                {post.source_references && post.source_references.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Grounding Citation:</span>
                    <span>
                      Page {post.source_references.map((r) => r.page_number).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400 italic">No social media posts generated.</p>
        )}
      </div>

      {/* Grounding Excerpts */}
      {data.source_references && data.source_references.length > 0 && (
        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5"
          >
            <span>{showSources ? "Hide Grounding Citations" : "Show Grounding Citations"}</span>
            <span className="text-slate-500">({data.source_references.length})</span>
            <span>{showSources ? "▲" : "▼"}</span>
          </button>

          {showSources && (
            <div className="mt-3 space-y-2">
              {data.source_references.map((ref, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1"
                >
                  <div className="font-semibold text-sky-400">
                    Source Page {ref.page_number}
                  </div>
                  <p className="italic text-slate-400">&ldquo;{ref.supporting_text}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
