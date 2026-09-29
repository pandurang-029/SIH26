"use client";

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function LandingPage({
  onOpenLogin,
  onOpenRegister,
  theme = "light",
  onToggleTheme,
}: LandingPageProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const transformationTypes = [
    {
      title: "Executive Summary",
      desc: "A tight, decision-ready brief for leadership.",
      tag: "Leadership",
    },
    {
      title: "Study Notes",
      desc: "Structured revision notes with key terms.",
      tag: "Education",
    },
    {
      title: "Presentation",
      desc: "Slide-by-slide deck content with talking points.",
      tag: "Visual",
    },
    {
      title: "Social Media",
      desc: "Threads, captions and hooks per platform.",
      tag: "Engagement",
    },
    {
      title: "Blog / Article",
      desc: "Long-form, publish-ready draft.",
      tag: "Content",
    },
    {
      title: "Report",
      desc: "Formal report with sections and findings.",
      tag: "Formal",
    },
    {
      title: "FAQ",
      desc: "Common questions answered from the source.",
      tag: "Reference",
    },
    {
      title: "Quiz / Questions",
      desc: "Assessment questions with answer keys.",
      tag: "Learning",
    },
    {
      title: "Simplified Explanation",
      desc: "Plain-language version anyone can follow.",
      tag: "Accessibility",
    },
    {
      title: "Key Points",
      desc: "The essentials, distilled into bullets.",
      tag: "Overview",
    },
    {
      title: "Email",
      desc: "A ready-to-send email built from the content.",
      tag: "Communication",
    },
  ];

  const features = [
    {
      icon: "🌐",
      title: "Six languages",
      desc: "English, Hindi, Marathi, Tamil, Telugu and Bengali — output, not just interface.",
    },
    {
      icon: "🎯",
      title: "Audience-aware",
      desc: "The same paper reads differently for a student, an executive and a researcher.",
    },
    {
      icon: "📁",
      title: "Projects & history",
      desc: "Every document, transformation and output stays organized and re-runnable.",
    },
    {
      icon: "🔒",
      title: "Private by default",
      desc: "Your documents stay inside your workspace and are never used for training.",
    },
    {
      icon: "🔗",
      title: "Share & export",
      desc: "Copy, download or share a result with a link in one click.",
    },
    {
      icon: "⚡",
      title: "Chain transformations",
      desc: "Turn a summary into slides, then slides into a social thread.",
    },
  ];

  const useCases = [
    {
      title: "Students & educators",
      desc: "Turn a 40-page chapter into revision notes, a quiz and a simplified explanation in a regional language.",
    },
    {
      title: "Researchers",
      desc: "Convert dense papers into executive summaries and key-insight briefs for funding conversations.",
    },
    {
      title: "Marketing teams",
      desc: "One campaign brief becomes a blog draft, a launch email and a social thread.",
    },
    {
      title: "Government & public sector",
      desc: "Publish citizen-facing FAQs and plain-language explainers from policy documents.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased bg-grid-mesh selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* 1. Header matching Page 1 */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8h12M13 4l4 4-4 4" />
                <path d="M20 16H8M11 20l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transform<span className="text-blue-600">AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Landing Navigation">
            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollTo("transformations")}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Transformations
            </button>
            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollTo("use-cases")}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Use cases
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Log in Button */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 transition"
            >
              Log in
            </button>

            {/* Get started Button */}
            <button
              type="button"
              onClick={onOpenRegister || onOpenLogin}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">
        
        {/* HERO SECTION (Page 1) */}
        <section className="text-center relative pt-4 sm:pt-8">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-sky-300/15 to-indigo-400/10 dark:from-blue-600/15 dark:via-cyan-500/10 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-sm mb-6 sm:mb-8">
            <span>✨</span>
            <span>Built for Smart India Hackathon 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.1] max-w-4xl mx-auto">
            Transform Any Content<br className="hidden sm:inline" />
            {" "}Into Something{" "}
            <span className="text-blue-600 dark:text-blue-500 font-extrabold">More</span>{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent font-extrabold">
              Powerful
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-normal">
            TransformAI uses AI to convert documents and content into summaries, study notes, presentations, reports, social posts, FAQs and more.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>

            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* Subtext */}
          <p className="mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            No credit card needed · 6 Indian languages · Works with PDF, DOCX, TXT, PPTX
          </p>

          {/* INTERACTIVE SOURCE -> OUTPUTS DIAGRAM CARD (Page 1) */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative transition-all">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
              
              {/* Left Column: Source Document */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Source
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-lg font-bold border border-red-200 dark:border-red-900/50">
                    📄
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Research Paper.pdf
                    </div>
                    <div className="text-xs text-slate-400">PDF · 3.4 MB · 22 pages</div>
                  </div>
                </div>

                {/* Skeleton Document Lines */}
                <div className="space-y-2 pt-2">
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-4/6" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                </div>
              </div>

              {/* Middle Icon: Transformation Connector */}
              <div className="md:col-span-1 flex justify-center items-center py-2 md:py-0">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 8h12M13 4l4 4-4 4" />
                    <path d="M20 16H8M11 20l-4-4 4-4" />
                  </svg>
                </div>
              </div>

              {/* Right Column: Generated Outputs Grid */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 text-left space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Generated Outputs
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between shadow-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>📋</span>
                      <span>Executive Summary</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                      Ready
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span>📚</span>
                    <span>Study Notes</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span>📊</span>
                    <span>Presentation</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span>💡</span>
                    <span>Key Insights</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 sm:col-span-2">
                    <span>❓</span>
                    <span>FAQ & Questions</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS (Page 1) */}
        <section id="how-it-works" className="space-y-8 scroll-mt-24">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Four steps from raw document to usable output
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/60">
                  1
                </span>
                <span className="text-base">📤</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Drop a PDF, DOCX, TXT or PPTX — or paste raw text.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60">
                  2
                </span>
                <span className="text-base">⚙️</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Choose output</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pick from eleven transformation types.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
                  3
                </span>
                <span className="text-base">✏️</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Configure</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Set audience, tone, language and length.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
                  4
                </span>
                <span className="text-base">🚀</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Transform</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Review, edit, copy, download or share.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: TRANSFORMATION TYPES (Page 1 & 2) */}
        <section id="transformations" className="space-y-8 scroll-mt-24">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Transformation Types
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              One source, eleven ways to use it
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {transformationTypes.map((item, idx) => (
              <div
                key={idx}
                onClick={onOpenLogin}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-500/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <span>Transform now</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: KEY FEATURES (Page 2) */}
        <section id="features" className="space-y-8 scroll-mt-24">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Key Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything the workflow actually needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: USE CASES (Page 2 & 3) */}
        <section id="use-cases" className="space-y-8 scroll-mt-24">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Use Cases
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Who reaches for TransformAI
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {useCases.map((uc, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{uc.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRE-FOOTER CTA BANNER (Page 3) */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-slate-900 border border-blue-200 dark:border-blue-900/60 p-8 sm:p-14 text-center space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
            Your next document deserves better than a skim
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Start with one upload and see what eleven outputs look like.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition active:scale-95"
            >
              Get Started Free →
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER (Page 3) */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M4 8h12M13 4l4 4-4 4" />
                    <path d="M20 16H8M11 20l-4-4 4-4" />
                  </svg>
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">TransformAI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                AI-powered content transformation for students, teams and institutions across India.
              </p>
            </div>

            {/* Product column */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Product</div>
              <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                <li><button type="button" onClick={() => scrollTo("features")} className="hover:text-blue-600">Features</button></li>
                <li><button type="button" onClick={() => scrollTo("transformations")} className="hover:text-blue-600">Transformations</button></li>
                <li><button type="button" onClick={() => scrollTo("use-cases")} className="hover:text-blue-600">Use Cases</button></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Pricing</span></li>
              </ul>
            </div>

            {/* Company column */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Company</div>
              <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                <li><span className="hover:text-blue-600 cursor-pointer">About</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Careers</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Blog</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Contact</span></li>
              </ul>
            </div>

            {/* Legal column */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Legal</div>
              <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                <li><span className="hover:text-blue-600 cursor-pointer">Privacy</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Terms</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Security</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Status</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-400">
            © 2026 TransformAI. Built for Smart India Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
}
