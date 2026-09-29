"use client";

interface WelcomeHeaderProps {
  onStartTransformation?: () => void;
  onExploreFeatures?: () => void;
}

export default function WelcomeHeader({
  onStartTransformation,
  onExploreFeatures,
}: WelcomeHeaderProps) {
  const scrollToFeatures = () => {
    if (onExploreFeatures) {
      onExploreFeatures();
      return;
    }
    const el = document.getElementById("features-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 text-center">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/15 via-cyan-400/10 to-indigo-500/10 dark:from-blue-600/10 dark:via-cyan-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-sm mb-6 sm:mb-8 transition-transform hover:scale-105">
        <span>✨</span>
        <span>Built for Smart India Hackathon 2026</span>
      </div>

      {/* 2. Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.1] max-w-4xl mx-auto">
        Transform Any Content<br className="hidden sm:inline" />
        {" "}Into Something{" "}
        <span className="text-blue-600 dark:text-blue-500 font-extrabold">More</span>{" "}
        <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent font-extrabold">
          Powerful
        </span>
      </h1>

      {/* 3. Subtitle */}
      <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-normal">
        TransformAI uses AI to convert documents and content into summaries, study notes, presentations, reports, social posts, FAQs and more.
      </p>

      {/* 4. Action Buttons */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
        <button
          type="button"
          onClick={onStartTransformation}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span>Get Started Free</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>

        <button
          type="button"
          onClick={scrollToFeatures}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Explore Features</span>
        </button>
      </div>

      {/* 5. Subtext */}
      <p className="mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
        No credit card needed · 6 Indian languages · Works with PDF, DOCX, TXT, PPTX
      </p>

    </div>
  );
}
