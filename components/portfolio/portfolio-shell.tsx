"use client";

import { useEffect, useRef, useState } from "react";

import { AboutSection } from "@/components/portfolio/about-section";
import { ContactSection } from "@/components/portfolio/contact-section";
import { ExperienceSection } from "@/components/portfolio/experience-section";
import { HeroSection } from "@/components/portfolio/hero-section";
import { ProjectsSection } from "@/components/portfolio/projects-section";
import { SkillsSection } from "@/components/portfolio/skills-section";
import { WaterOverlay } from "@/components/portfolio/water-overlay";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

type SectionId = (typeof sections)[number]["id"];

const LIGHT_WATER_OPACITY_MIN = 0.18;
const LIGHT_WATER_OPACITY_MAX = 0.5;

const clampLightWaterOpacity = (value: number) =>
  Math.min(LIGHT_WATER_OPACITY_MAX, Math.max(LIGHT_WATER_OPACITY_MIN, value));

function NavIcon({ sectionId }: { sectionId: SectionId }) {
  const common = "h-4 w-4";

  if (sectionId === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.75 9.75V21h10.5V9.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (sectionId === "about") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (sectionId === "projects") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M3.75 6.75h16.5v10.5H3.75z" stroke="currentColor" strokeWidth="1.7" rx="1.5" />
        <path d="M9 16.5 12 13.5l2.25 2.25 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (sectionId === "skills") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="m8.25 15.75-3 3V5.25h13.5v13.5h-13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9.75 8.25 1.5-1.5 3 3-1.5 1.5-3-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (sectionId === "experience") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
        <path d="M5.25 6h13.5M5.25 12h13.5M5.25 18h13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="7.5" cy="6" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="16.5" cy="18" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
      <path d="M4.5 6.75h15v10.5h-15z" stroke="currentColor" strokeWidth="1.7" rx="1.5" />
      <path d="m5.25 7.5 6.75 5.25L18.75 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PortfolioShell() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }


    const storedTheme = window.localStorage.getItem("portfolio-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return storedTheme ? storedTheme === "light" : prefersLight;
  });
  const [lightWaterOpacity, setLightWaterOpacity] = useState(() => {
    if (typeof window === "undefined") {
      return 0.32;
    }

    const storedWaterOpacity = window.localStorage.getItem("portfolio-light-water-opacity");
    const parsedOpacity = storedWaterOpacity ? Number.parseFloat(storedWaterOpacity) : Number.NaN;
    return Number.isFinite(parsedOpacity) ? clampLightWaterOpacity(parsedOpacity) : 0.32;
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const theme = isLightMode ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.setProperty("--light-water-overlay-opacity", lightWaterOpacity.toFixed(3));
    window.localStorage.setItem("portfolio-theme", theme);
    window.localStorage.setItem("portfolio-light-water-opacity", lightWaterOpacity.toFixed(3));
  }, [isLightMode, lightWaterOpacity]);

  useEffect(() => {
    const container = mainRef.current;

    if (!container) {
      return;
    }

    let frame = 0;

    const update = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      const progress = maxScroll > 0 ? container.scrollTop / maxScroll : 0;

      setScrollProgress(progress);
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const container = mainRef.current;

    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      {
        root: container,
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.6],
      }
    );

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let oscillators: OscillatorNode[] = [];
    let gain: GainNode | null = null;

    if (isAudioPlaying && typeof window !== "undefined") {
      audioContext = new window.AudioContext();
      gain = audioContext.createGain();
      gain.gain.value = 0.018;
      gain.connect(audioContext.destination);

      // Lightweight ambient tone that avoids downloading audio assets.
      const tones = [164.81, 220, 261.63];
      oscillators = tones.map((frequency, index) => {
        const oscillator = audioContext!.createOscillator();
        oscillator.type = index === 2 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        oscillator.connect(gain!);
        oscillator.start();
        return oscillator;
      });
    }

    return () => {
      for (const oscillator of oscillators) {
        oscillator.stop();
      }
      gain?.disconnect();
      audioContext?.close();
    };
  }, [isAudioPlaying]);

  return (
    <div className="portfolio-root relative overflow-x-clip">
      <a
        href="#main-content"
        className="skip-link absolute left-4 top-4 z-50 -translate-y-14 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="bg-orb bg-orb-a" aria-hidden="true" />
      <div className="bg-orb bg-orb-b" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <WaterOverlay />

      <aside className={`group fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-14 overflow-hidden rounded-[1.75rem] border p-2 backdrop-blur-xl transition-[width] duration-500 hover:w-64 lg:flex lg:flex-col ${isLightMode ? "border-zinc-900/10 bg-white/70 shadow-[0_18px_60px_-36px_rgba(14,116,144,0.35)]" : "border-white/15 bg-zinc-900/40 shadow-[0_20px_80px_-45px_rgba(34,211,238,0.55)]"}`}>
        <div className={`rounded-xl border px-3 py-2 ${isLightMode ? "border-zinc-900/10 bg-white/80" : "border-white/15 bg-white/[0.04]"}`}>
          <p className={`text-[10px] uppercase tracking-[0.22em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isLightMode ? "text-cyan-700/80" : "text-cyan-200/80"}`}>Portfolio</p>
          <p className={`mt-1 text-sm font-semibold tracking-[0.12em] ${isLightMode ? "text-zinc-800" : "text-zinc-100"}`}>SB</p>
          <p className={`mt-1 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isLightMode ? "text-zinc-600" : "text-zinc-300"}`}>Suvraneel Bhuin</p>
        </div>

        <button
          type="button"
          className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.16em] transition ${isAudioPlaying ? (isLightMode ? "border-cyan-500/35 bg-cyan-400/12 text-cyan-700" : "border-cyan-200/40 bg-cyan-300/10 text-cyan-100") : (isLightMode ? "border-zinc-900/10 bg-white/80 text-zinc-600 hover:border-cyan-500/35 hover:text-cyan-700" : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-cyan-200/30 hover:text-cyan-100")}`}
          onClick={() => setIsAudioPlaying((value) => !value)}
          aria-pressed={isAudioPlaying}
          aria-label={isAudioPlaying ? "Disable ambient sound" : "Enable ambient sound"}
        >
          <span className="inline-flex h-4 w-4 items-end gap-[2px]" aria-hidden="true">
            <span className={`w-[3px] rounded-full bg-current ${isAudioPlaying ? "h-4 animate-pulse" : "h-2"}`} />
            <span className={`w-[3px] rounded-full bg-current ${isAudioPlaying ? "h-3 animate-pulse" : "h-1.5"}`} />
            <span className={`w-[3px] rounded-full bg-current ${isAudioPlaying ? "h-2.5 animate-pulse" : "h-1"}`} />
          </span>
          <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {isAudioPlaying ? "Sound On" : "Sound Off"}
          </span>
        </button>

        <div className={`mt-2 rounded-xl border px-3 py-2 ${isLightMode ? "border-zinc-900/10 bg-white/80" : "border-white/10 bg-white/[0.02]"}`}>
          <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.16em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isLightMode ? "text-cyan-700/85" : "text-cyan-200/80"}`}>
            <span>Water Trail</span>
            <span>{Math.round(lightWaterOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={LIGHT_WATER_OPACITY_MIN}
            max={LIGHT_WATER_OPACITY_MAX}
            step={0.01}
            value={lightWaterOpacity}
            onChange={(event) => setLightWaterOpacity(clampLightWaterOpacity(Number.parseFloat(event.target.value)))}
            aria-label="Light mode water visibility"
            className="mt-2 h-1.5 w-full cursor-pointer accent-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>

        <button
          type="button"
          className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.16em] transition ${isLightMode ? "border-amber-500/35 bg-amber-300/15 text-amber-700" : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-amber-200/40 hover:text-amber-100"}`}
          onClick={() => setIsLightMode((value) => !value)}
          aria-pressed={isLightMode}
          aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
            {isLightMode ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M12 3.75v2.1M12 18.15v2.1M5.48 5.48l1.48 1.48M17.04 17.04l1.48 1.48M3.75 12h2.1M18.15 12h2.1M5.48 18.52l1.48-1.48M17.04 6.96l1.48-1.48" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M20.25 13.2A8.25 8.25 0 1 1 10.8 3.75a7.2 7.2 0 0 0 9.45 9.45Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {isLightMode ? "Light On" : "Light Off"}
          </span>
        </button>

        <nav aria-label="Section navigation" className="mt-3 flex flex-1 flex-col gap-1.5">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${activeSection === section.id ? (isLightMode ? "border-cyan-500/35 bg-cyan-400/12 text-cyan-700" : "border-cyan-200/35 bg-cyan-300/12 text-cyan-100") : (isLightMode ? "border-transparent text-zinc-600 hover:border-cyan-500/30 hover:bg-cyan-400/10 hover:text-cyan-700" : "border-transparent text-zinc-300 hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-cyan-100")}`}
            >
              <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${activeSection === section.id ? (isLightMode ? "border-cyan-500/45 text-cyan-700" : "border-cyan-200/50 text-cyan-100") : (isLightMode ? "border-zinc-900/15 text-zinc-500 group-hover:border-cyan-500/40 group-hover:text-cyan-700" : "border-white/15 text-zinc-400 group-hover:border-cyan-200/40 group-hover:text-cyan-100")}`}>
                <NavIcon sectionId={section.id} />
              </span>
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">{section.label}</span>
            </a>
          ))}
        </nav>

        <div className={`mt-2 space-y-2 border-t px-1 pt-3 ${isLightMode ? "border-zinc-900/10" : "border-white/10"}`}>
          <a
            href="mailto:bsuvraneel@gmail.com"
            className={`inline-flex w-full items-center justify-center rounded-xl border px-3 py-2 text-[11px] uppercase tracking-[0.16em] opacity-0 transition duration-300 group-hover:opacity-100 ${isLightMode ? "border-cyan-500/35 bg-cyan-400/12 text-cyan-700 hover:bg-cyan-400/20" : "border-cyan-200/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"}`}
          >
            Contact
          </a>
          <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <a href="https://github.com/Suvraneel" target="_blank" rel="noreferrer" className={`flex-1 rounded-xl border px-3 py-2 text-center text-xs transition ${isLightMode ? "border-zinc-900/15 bg-white/80 text-zinc-600 hover:text-fuchsia-600" : "border-white/15 bg-white/[0.04] text-zinc-300 hover:text-fuchsia-200"}`}>
              GH
            </a>
            <a href="https://www.linkedin.com/in/suvraneel-bhuin/" target="_blank" rel="noreferrer" className={`flex-1 rounded-xl border px-3 py-2 text-center text-xs transition ${isLightMode ? "border-zinc-900/15 bg-white/80 text-zinc-600 hover:text-cyan-700" : "border-white/15 bg-white/[0.04] text-zinc-300 hover:text-cyan-100"}`}>
              IN
            </a>
            <a href="https://twitter.com/SuvraneelB" target="_blank" rel="noreferrer" className={`flex-1 rounded-xl border px-3 py-2 text-center text-xs transition ${isLightMode ? "border-zinc-900/15 bg-white/80 text-zinc-600 hover:text-sky-600" : "border-white/15 bg-white/[0.04] text-zinc-300 hover:text-sky-300"}`}>
              X
            </a>
          </div>

          <div className="flex items-center justify-between px-1 pt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span>Suvraneel</span>
            <span>2026</span>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className={`fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-xl transition-colors lg:hidden ${isLightMode ? "border-zinc-900/15 bg-white/80 text-zinc-700" : "border-white/15 bg-zinc-900/60 text-zinc-200"}`}
        onClick={() => setMobileNavOpen((value) => !value)}
        aria-expanded={mobileNavOpen}
        aria-controls="mobile-nav-drawer"
        aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <span className="relative inline-flex h-4 w-5 items-center justify-center" aria-hidden="true">
          <span
            className={`absolute h-[2px] w-5 rounded bg-current transition ${mobileNavOpen ? "translate-y-0 rotate-45" : "-translate-y-[6px]"}`}
          />
          <span
            className={`absolute h-[2px] w-5 rounded bg-current transition ${mobileNavOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`absolute h-[2px] w-5 rounded bg-current transition ${mobileNavOpen ? "translate-y-0 -rotate-45" : "translate-y-[6px]"}`}
          />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] transition-opacity lg:hidden ${mobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav-drawer"
        className={`fixed left-4 top-16 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border p-3 backdrop-blur-xl transition duration-300 lg:hidden ${isLightMode ? "border-zinc-900/15 bg-white/80 shadow-[0_16px_52px_-30px_rgba(14,116,144,0.35)]" : "border-white/15 bg-zinc-900/70 shadow-[0_16px_52px_-26px_rgba(34,211,238,0.55)]"} ${mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"}`}
        aria-label="Mobile section navigation"
        style={{
          clipPath: mobileNavOpen
            ? "circle(130% at 1.5rem 1.5rem)"
            : "circle(1.65rem at 1.5rem 1.5rem)",
          transitionProperty: "clip-path, transform, opacity",
          transitionDuration: "420ms",
          transitionTimingFunction: "cubic-bezier(0.2, 0.9, 0.2, 1)",
        }}
      >
        <div className={`mb-2 border-b pb-2 text-[11px] uppercase tracking-[0.2em] ${isLightMode ? "border-zinc-900/10 text-cyan-700/80" : "border-white/10 text-cyan-200/80"}`}>Navigate</div>
        <div className="grid gap-1">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`rounded-xl px-3 py-2 text-xs uppercase tracking-[0.16em] transition ${activeSection === section.id ? (isLightMode ? "bg-cyan-400/15 text-cyan-700" : "bg-cyan-300/15 text-cyan-100") : (isLightMode ? "text-zinc-600 hover:bg-cyan-400/15 hover:text-cyan-700" : "text-zinc-300 hover:bg-cyan-300/15 hover:text-cyan-100")}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="inline-flex items-center gap-2">
                <NavIcon sectionId={section.id} />
                {section.label}
              </span>
            </a>
          ))}
        </div>
      </nav>

      <main
        id="main-content"
        ref={mainRef}
        className="h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth pt-12 lg:pl-[5.5rem] lg:pt-0"
      >
        <HeroSection scrollProgress={scrollProgress} />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
    </div>
  );
}

