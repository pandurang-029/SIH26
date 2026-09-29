"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/components/landing/LandingPage";
import AuthPage from "@/components/auth/AuthPage";
import LoginModal from "@/components/auth/LoginModal";
import Header from "@/components/layout/Header";
import PipelineStatusCard from "@/components/dashboard/PipelineStatusCard";
import DocumentUploadCard from "@/components/upload/DocumentUploadCard";
import ExtractedPreviewCard from "@/components/preview/ExtractedPreviewCard";
import AnalysisWorkspaceCard from "@/components/intelligence/AnalysisWorkspaceCard";
import SettingsCard from "@/components/transformation/SettingsCard";
import OutputFormatsCard from "@/components/transformation/OutputFormatsCard";
import GeneratedOutputsWorkspace from "@/components/outputs/GeneratedOutputsWorkspace";
import ResultsSection from "@/components/outputs/ResultsSection";
import RecentActivitySection from "@/components/outputs/RecentActivitySection";
import TemplatesSection from "@/components/sections/TemplatesSection";
import SettingsSection from "@/components/sections/SettingsSection";
import HistorySection from "@/components/sections/HistorySection";
import DocumentsSection from "@/components/sections/DocumentsSection";
import {
  DocumentExtractionResponse,
  CommonContentRepresentation,
  GeneratedOutputsResponse,
  TransformationSettings,
} from "@/lib/types";
import { analyzeDocumentContent, generateDocumentOutputs } from "@/lib/api";
import { saveHistoryRecord, getHistoryRecords, HistoryRecord } from "@/lib/history";

interface UserProfile {
  name: string;
  role: string;
  email: string;
}

export default function Home() {
  // Authentication & Navigation State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"landing" | "login" | "register">("landing");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Workflow Data States
  const [extractionData, setExtractionData] = useState<DocumentExtractionResponse | null>(null);
  const [analysisData, setAnalysisData] = useState<CommonContentRepresentation | null>(null);
  const [outputsData, setOutputsData] = useState<GeneratedOutputsResponse | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStepMessage, setAnalysisStepMessage] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([
    "exec_summary",
    "advisory",
    "presentation",
  ]);
  const [settings, setSettings] = useState<TransformationSettings>({
    audience: "Senior Officials",
    tone: "Formal",
    language: "English",
    detailLevel: "Medium",
    objective: "Inform",
  });

  const [isGeneratingOutputs, setIsGeneratingOutputs] = useState<boolean>(false);
  const [generationStepMessage, setGenerationStepMessage] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Initialize theme & check persistent auth
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("transformai_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.remove("dark");
      }

      const savedAuth = localStorage.getItem("transformai_auth");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("transformai_theme", nextTheme);
    } catch {}
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthMode("landing");
    try {
      localStorage.setItem("transformai_auth", JSON.stringify(user));
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode("landing");
    try {
      localStorage.removeItem("transformai_auth");
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleOutput = (outputId: string) => {
    if (selectedOutputs.includes(outputId)) {
      if (selectedOutputs.length > 1) {
        setSelectedOutputs(selectedOutputs.filter((id) => id !== outputId));
      }
    } else {
      setSelectedOutputs([...selectedOutputs, outputId]);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!extractionData) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    setAnalysisStepMessage("Analyzing source content...");
    await new Promise((resolve) => setTimeout(resolve, 400));

    setAnalysisStepMessage("Understanding content & extracting facts...");
    const res = await analyzeDocumentContent(extractionData.document_id);

    if (res.success && res.data) {
      setAnalysisStepMessage("Structuring findings...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAnalysisData(res.data);
      setAnalysisStepMessage("Analysis complete.");

      const friendlyFormats: Record<string, string> = {
        exec_summary: "Executive Summary",
        executive_summary: "Executive Summary",
        advisory: "Advisory",
        presentation: "Presentation",
        social_media: "Social Media",
        infographic: "Infographic",
      };

      try {
        saveHistoryRecord({
          id: extractionData.document_id,
          name: extractionData.filename,
          docTitle: res.data.document_title || extractionData.filename,
          audience: settings.audience,
          tone: settings.tone,
          language: settings.language,
          formats: selectedOutputs.map((o) => friendlyFormats[o] || o),
          extractionData: extractionData,
          analysisData: res.data,
          status: "Reviewed",
        });
      } catch {
        // Safe fallback in restricted environments
      }
    } else {
      setAnalysisError(res.error || "AI service is temporarily unavailable. Please retry.");
    }

    setIsAnalyzing(false);
  };

  const handleGenerateOutputsClick = async () => {
    if (!extractionData) return;
    setIsGeneratingOutputs(true);
    setGenerationError(null);

    const typeMapping: Record<string, string> = {
      exec_summary: "executive_summary",
      advisory: "advisory",
      presentation: "presentation",
      social_media: "social_media",
      infographic: "infographic",
    };

    const backendTypes = selectedOutputs
      .map((id) => typeMapping[id])
      .filter(Boolean);

    if (backendTypes.length === 0) {
      setGenerationError("Please select at least one supported output format.");
      setIsGeneratingOutputs(false);
      return;
    }

    const configPayload = {
      audience: settings.audience.toLowerCase().replace(/ /g, "_"),
      tone: settings.tone.toLowerCase(),
      language: settings.language.toLowerCase(),
      detail_level: settings.detailLevel.toLowerCase(),
      communication_objective: settings.objective.toLowerCase(),
    };

    setGenerationStepMessage("Preparing outputs with Transformation Config...");
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (backendTypes.includes("executive_summary")) {
      setGenerationStepMessage("Generating Executive Summary...");
    }
    if (backendTypes.includes("advisory")) {
      setGenerationStepMessage("Generating Advisory...");
    }
    if (backendTypes.includes("presentation")) {
      setGenerationStepMessage("Generating Presentation...");
    }
    if (backendTypes.includes("social_media")) {
      setGenerationStepMessage("Generating Social Media Content...");
    }
    if (backendTypes.includes("infographic")) {
      setGenerationStepMessage("Generating Infographic Specification...");
    }

    const res = await generateDocumentOutputs(
      extractionData.document_id,
      backendTypes,
      configPayload
    );

    if (res.success && res.data) {
      setGenerationStepMessage("Validating outputs...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setOutputsData(res.data);
      setGenerationStepMessage("Complete.");

      const friendlyFormats: Record<string, string> = {
        exec_summary: "Executive Summary",
        executive_summary: "Executive Summary",
        advisory: "Advisory",
        presentation: "Presentation",
        social_media: "Social Media",
        infographic: "Infographic",
      };

      try {
        saveHistoryRecord({
          id: extractionData.document_id,
          name: extractionData.filename,
          docTitle: analysisData?.document_title || extractionData.filename,
          audience: settings.audience,
          tone: settings.tone,
          language: settings.language,
          formats: backendTypes.map((t) => friendlyFormats[t] || t),
          extractionData: extractionData,
          analysisData: analysisData,
          outputsData: res.data,
          status: "Verified",
        });
      } catch {
        // Safe fallback in restricted environments
      }
    } else {
      setGenerationError(res.error || "Output generation failed. Please check parameters and retry.");
    }

    setIsGeneratingOutputs(false);
  };

  const handleExtractionSuccess = (data: DocumentExtractionResponse | null) => {
    setExtractionData(data);
    if (data) {
      try {
        saveHistoryRecord({
          id: data.document_id,
          name: data.filename,
          docTitle: data.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          audience: settings.audience,
          tone: settings.tone,
          language: settings.language,
          formats: ["Executive Summary"],
          extractionData: data,
          status: "Reviewed",
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleRestoreRecord = (recordId: string, record?: HistoryRecord) => {
    const targetRecord = record || getHistoryRecords().find((r) => r.id === recordId);
    if (targetRecord) {
      if (targetRecord.extractionData) setExtractionData(targetRecord.extractionData);
      if (targetRecord.analysisData) setAnalysisData(targetRecord.analysisData);
      if (targetRecord.outputsData) setOutputsData(targetRecord.outputsData);
      if (targetRecord.outputsData) {
        setActiveTab("Generated Outputs");
      } else if (targetRecord.analysisData) {
        setActiveTab("New Transformation");
      } else {
        setActiveTab("Documents");
      }
    } else {
      setActiveTab("Generated Outputs");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearDocument = () => {
    setExtractionData(null);
    setAnalysisData(null);
    setOutputsData(null);
    setAnalysisError(null);
    setGenerationError(null);
  };

  const handleApplyTemplate = (
    newSettings: TransformationSettings,
    newOutputs: string[]
  ) => {
    setSettings(newSettings);
    setSelectedOutputs(newOutputs);
    setActiveTab("New Transformation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -------------------------------------------------------------
  // VIEW 1: FIRST MAIN PAGE (LANDING PAGE OR AUTH PAGE)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    if (authMode === "login" || authMode === "register") {
      return (
        <AuthPage
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => {
            setAuthMode("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }

    return (
      <LandingPage
        onOpenLogin={() => {
          setAuthMode("login");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenRegister={() => {
          setAuthMode("register");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED WORKSPACE AFTER SUCCESSFUL LOGIN
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased bg-grid-mesh transition-colors">
      {/* 1. Authenticated Workspace Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Full-Width Workspace (Sidebar replaced by sensible top Navbar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {/* Quick Launch Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
                    <span>✨</span>
                    <span>Start New Document Transformation</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Upload source files (PDF, DOCX, TXT) to generate grounded multi-output briefs tailored to any audience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("New Transformation");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-bold text-xs sm:text-sm text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Open Transformation Workspace</span>
                  <span>→</span>
                </button>
              </div>

              {/* Pipeline Status Card */}
              <PipelineStatusCard
                hasDocument={!!extractionData}
                hasExtractedText={!!extractionData?.full_text}
                hasAnalysisData={!!analysisData}
                hasOutputs={!!outputsData}
                hasQualityCheck={!!outputsData}
                isReadyForExport={!!outputsData}
              />

              {/* If document uploaded, show preview */}
              {extractionData && (
                <ExtractedPreviewCard
                  extractionData={extractionData}
                  onClearDocument={handleClearDocument}
                />
              )}

              {/* Recent Activity */}
              <RecentActivitySection
                onSelectRecord={handleRestoreRecord}
                onViewAllHistory={() => {
                  setActiveTab("History");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          {/* TAB 2: NEW TRANSFORMATION WORKSPACE */}
          {activeTab === "New Transformation" && (
            <div className="space-y-6">
              <PipelineStatusCard
                hasDocument={!!extractionData}
                hasExtractedText={!!extractionData?.full_text}
                hasAnalysisData={!!analysisData}
                hasOutputs={!!outputsData}
                hasQualityCheck={!!outputsData}
                isReadyForExport={!!outputsData}
              />

              {/* Step 1: Source Document Upload */}
              <DocumentUploadCard
                onExtractionSuccess={handleExtractionSuccess}
                onClearDocument={handleClearDocument}
              />

              {/* Extracted Content Preview */}
              {extractionData && (
                <div className="space-y-6">
                  <ExtractedPreviewCard
                    extractionData={extractionData}
                    onClearDocument={handleClearDocument}
                  />

                  {/* AI Analysis Trigger Card */}
                  {!analysisData && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                          <span>🧠</span>
                          <span>Cognitive Document Intelligence</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Analyze document text with advanced neural intelligence to construct a grounded Common Content Representation.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={handleAnalyzeClick}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 font-bold text-xs text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        {isAnalyzing ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>{analysisStepMessage || "Analyzing..."}</span>
                          </>
                        ) : (
                          <>
                            <span>Analyze with AI</span>
                            <span>✨</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Analysis Error Message Banner */}
                  {analysisError && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-200 text-xs flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 text-base">⚠️</span>
                        <div>
                          <div className="font-bold text-red-800 dark:text-red-300">AI Analysis Error</div>
                          <div className="mt-0.5">{analysisError}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAnalyzeClick}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  )}

                  {/* Step 4: AI Analysis Workspace */}
                  {analysisData && (
                    <AnalysisWorkspaceCard analysisData={analysisData} />
                  )}
                </div>
              )}

              {/* Step 2: Transformation Settings */}
              <SettingsCard
                settings={settings}
                onChange={setSettings}
              />

              {/* Step 3: Select Output Formats */}
              <OutputFormatsCard
                selectedOutputs={selectedOutputs}
                onToggleOutput={handleToggleOutput}
              />

              {/* Step 5: Transform / Generate Outputs Button Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    Multi-Output Generation (CCR Source of Truth)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {!extractionData
                      ? "Upload a document above and extract text to enable output generation."
                      : `Ready to generate ${selectedOutputs.length} output format${selectedOutputs.length > 1 ? "s" : ""} from Common Content Representation.`}
                  </p>
                </div>

                <button
                  id="transform-btn"
                  type="button"
                  disabled={!extractionData || isGeneratingOutputs}
                  onClick={handleGenerateOutputsClick}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-bold text-sm text-white shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {isGeneratingOutputs ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>{generationStepMessage || "Generating..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Outputs</span>
                      <span className="text-base">⚡</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Generation Error Banner */}
              {generationError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-200 text-xs flex items-start gap-3 shadow-sm">
                  <span className="text-red-500 text-base">⚠️</span>
                  <div className="flex-1">
                    <div className="font-bold text-red-800 dark:text-red-300">Generation Error</div>
                    <div className="mt-0.5">{generationError}</div>
                  </div>
                </div>
              )}

              {/* Render Generated Outputs Workspace when outputs are available */}
              {outputsData ? (
                <GeneratedOutputsWorkspace outputsData={outputsData} />
              ) : (
                <ResultsSection />
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS MANAGEMENT */}
          {activeTab === "Documents" && (
            <DocumentsSection
              extractionData={extractionData}
              onExtractionSuccess={handleExtractionSuccess}
              onClearDocument={handleClearDocument}
              onNavigateToTransformation={() => {
                setActiveTab("New Transformation");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* TAB 4: GENERATED OUTPUTS */}
          {activeTab === "Generated Outputs" && (
            <div className="space-y-6">
              {outputsData ? (
                <GeneratedOutputsWorkspace outputsData={outputsData} />
              ) : (
                <ResultsSection />
              )}
            </div>
          )}

          {/* TAB 5: TEMPLATES GALLERY */}
          {activeTab === "Templates" && (
            <TemplatesSection onApplyTemplate={handleApplyTemplate} />
          )}

          {/* TAB 6: HISTORY & AUDIT LOG */}
          {activeTab === "History" && (
            <HistorySection
              onSelectRecord={handleRestoreRecord}
            />
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === "Settings" && <SettingsSection />}
        </main>
    </div>
  );
}
