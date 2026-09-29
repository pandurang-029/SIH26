"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadedFileMeta, DocumentExtractionResponse } from "@/lib/types";
import { uploadDocumentFile, extractDocumentContent } from "@/lib/api";

interface DocumentUploadCardProps {
  onExtractionSuccess: (data: DocumentExtractionResponse | null) => void;
  onClearDocument: () => void;
}

export type PipelineStage = "idle" | "uploading" | "uploaded" | "extracting" | "success" | "error";

export default function DocumentUploadCard({
  onExtractionSuccess,
  onClearDocument,
}: DocumentUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("Uploading document to server...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<UploadedFileMeta | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processFileUploadAndExtraction = async (file: File) => {
    setRawFile(file);
    setFileMeta({
      name: file.name,
      size: file.size,
      type: file.type || file.name.split(".").pop()?.toUpperCase() || "DOCUMENT",
    });
    setErrorMessage(null);
    onExtractionSuccess(null);

    // 1. Uploading Stage
    setStage("uploading");
    setStatusMessage("Uploading document to server...");

    const uploadRes = await uploadDocumentFile(file);
    if (!uploadRes.success || !uploadRes.data) {
      setStage("error");
      setErrorMessage(uploadRes.error || "Unable to upload document to backend server.");
      return;
    }

    const docId = uploadRes.data.document_id;
    setCurrentDocumentId(docId);
    setStage("uploaded");
    setStatusMessage("Uploaded successfully.");

    // 2. Extracting Stage
    setStage("extracting");
    setStatusMessage("Extracting text content from document...");

    const extractRes = await extractDocumentContent(docId);
    if (!extractRes.success || !extractRes.data) {
      setStage("error");
      setErrorMessage(extractRes.error || "Unable to extract content from this document.");
      return;
    }

    // 3. Success Stage
    setStage("success");
    setStatusMessage("Content extracted successfully.");
    onExtractionSuccess(extractRes.data);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUploadAndExtraction(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUploadAndExtraction(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setStage("idle");
    setFileMeta(null);
    setCurrentDocumentId(null);
    setRawFile(null);
    setErrorMessage(null);
    setStatusMessage("");
    onClearDocument();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRetry = () => {
    if (rawFile) {
      processFileUploadAndExtraction(rawFile);
    }
  };

  return (
    <div id="upload-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📄</span>
          <span>Source Document Intake</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Step 1 of 3
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,.docx,.txt"
        className="hidden"
        id="file-upload-input"
        aria-label="Upload Source Document"
      />

      {stage === "idle" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="Drag and drop or browse files for document upload"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3.5 text-2xl shadow-sm">
            📥
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
            Drop your document here, or browse
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Supported formats: <strong className="text-slate-700 dark:text-slate-300 font-semibold">PDF, DOCX, TXT</strong> (Up to 25 MB)
          </p>
          <button
            type="button"
            className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 rounded-xl transition"
          >
            Browse files from device
          </button>
        </div>
      )}

      {(stage === "uploading" || stage === "uploaded" || stage === "extracting" || stage === "success") && fileMeta && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm uppercase shadow-sm">
                {fileMeta.name.split(".").pop() || "DOC"}
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm max-w-xs sm:max-w-md truncate">
                  {fileMeta.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                  <span>Size: <strong className="text-slate-700 dark:text-slate-300">{formatFileSize(fileMeta.size)}</strong></span>
                  {currentDocumentId && (
                    <span>ID: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-300 font-mono text-[11px]">{currentDocumentId.substring(0, 8)}...</code></span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-semibold"
              title="Remove document and start over"
            >
              Change File ✕
            </button>
          </div>

          {/* Progress Indicator Banner */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              {stage === "success" ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              )}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{statusMessage}</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {stage === "uploading" && "Stage 1/2"}
              {stage === "extracting" && "Stage 2/2"}
              {stage === "success" && "Ready for transformation"}
            </span>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 text-sm">
              <span>⚠️</span>
              <span>Unable to extract content from this document</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Choose another file
            </button>
          </div>
          <p className="text-xs text-red-700 dark:text-red-200/90 leading-relaxed">
            {errorMessage || "An unexpected error occurred while uploading or extracting text from this document."}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-sm"
            >
              Retry Extraction 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
