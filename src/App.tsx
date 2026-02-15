import { useState, useEffect } from "react";
import { profile, projects } from "./data";
import MemoryMatch from "./games/MemoryMatch";
import ReactionTime from "./games/ReactionTime";
import Snake from "./games/Snake";

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-xl border px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
    >
      {copied ? "Copied!" : "Email"}
    </button>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs dark:border-zinc-600 dark:text-zinc-300">
      {text}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight mb-3 dark:text-zinc-100">{children}</h2>
  );
}

function ProjectCard(props: {
  title: string;
  description: string;
  tech: string[];
  live?: string;
  github?: string;
}) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm bg-white dark:bg-zinc-800 dark:border-zinc-700 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold dark:text-zinc-100">{props.title}</h3>
        <div className="flex gap-2">
          {props.github && (
            <a className="text-sm underline" href={props.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {props.live && (
            <a className="text-sm underline" href={props.live} target="_blank" rel="noreferrer">
              Live
            </a>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{props.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {props.tech.map((t) => (
          <Badge key={t} text={t} />
        ))}
      </div>
    </div>
  );
}

const GAMES = [
  {
    id: "memory",
    title: "Memory Match",
    description: "Flip cards and find matching pairs. Test your memory!",
    icon: "🎯",
    Component: MemoryMatch,
  },
  {
    id: "snake",
    title: "Snake",
    description: "Classic snake. Eat the red dot and don't run into yourself.",
    icon: "🐍",
    Component: Snake,
  },
  {
    id: "reaction",
    title: "Reaction Time",
    description: "Click when the screen turns green. How fast are you?",
    icon: "⚡",
    Component: ReactionTime,
  },
] as const;

const API_BASE = typeof import.meta.env.VITE_API_URL === "string" && import.meta.env.VITE_API_URL.trim() !== ""
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : null;

type ApiStatus = { service: string; version: string; runtime: string; uptimeSeconds: number };
type ApiFocus = { focus: string; updated: string };

function LiveDotNetSection() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [focus, setFocus] = useState<ApiFocus | null>(null);
  const [loading, setLoading] = useState(!!API_BASE);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!API_BASE) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError(false);
    Promise.all([
      fetch(`${API_BASE}/api/status`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`${API_BASE}/api/focus`).then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([s, f]) => {
        if (!cancelled) {
          setStatus(s as ApiStatus);
          setFocus(f as ApiFocus);
        }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-2xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 p-6 shadow-sm transition-colors">
      <SectionTitle>Live from .NET</SectionTitle>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        This section is powered by a .NET 8 Minimal API. It shows full-stack React + C# in action.
      </p>
      {!API_BASE && (
        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-700/50 p-4 text-sm text-zinc-700 dark:text-zinc-300">
          <p className="font-medium mb-2">Run the API locally to see live data:</p>
          <code className="block rounded-lg bg-zinc-200 dark:bg-zinc-600 px-3 py-2 text-xs">
            cd backend/Portfolio.Api && dotnet run
          </code>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Then set <code className="rounded px-1 bg-zinc-200 dark:bg-zinc-600">VITE_API_URL=http://localhost:5050</code> and restart the dev server. Deploy the API to Azure or Railway and set <code className="rounded px-1 bg-zinc-200 dark:bg-zinc-600">VITE_API_URL</code> in Vercel for production.
          </p>
        </div>
      )}
      {API_BASE && loading && (
        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-700/50 p-4 text-sm text-zinc-600 dark:text-zinc-400">
          Connecting to API…
        </div>
      )}
      {API_BASE && error && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
          Couldn’t reach the API. Make sure it’s running at <code className="break-all">{API_BASE}</code> or deploy it and set <code>VITE_API_URL</code>.
        </div>
      )}
      {API_BASE && status && focus && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-600 p-4">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">API Status</p>
            <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">{status.service} v{status.version}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{status.runtime}</p>
            <p className="mt-1 text-xs text-zinc-500">Uptime: {status.uptimeSeconds}s</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-600 p-4">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current focus</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">&ldquo;{focus.focus}&rdquo;</p>
          </div>
        </div>
      )}
    </section>
  );
}

function GamesSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <section>
      <SectionTitle>Games</SectionTitle>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        A few mini-games built with React — have fun and see what you can build with the same stack.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {GAMES.map(({ id, title, description, icon, Component }) => (
          <div key={id} className="rounded-2xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{icon}</span>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
              <button
                type="button"
                onClick={() => setOpenId(openId === id ? null : id)}
                className="mt-3 w-full rounded-xl border border-zinc-300 bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {openId === id ? "Close" : "Play"}
              </button>
            </div>
            {openId === id && (
              <div className="border-t border-zinc-200 bg-zinc-50/50 p-4">
                <Component />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("portfolio-theme");
    if (stored === "dark" || stored === "light") return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("portfolio-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("portfolio-theme", "light");
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="mx-auto max-w-4xl px-5 py-10">
        {/* Header */}
        <header className="rounded-2xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 p-6 shadow-sm transition-colors">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              <img
                src="/profile.png"
                alt=""
                className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-zinc-200 sm:h-28 sm:w-28"
              />
              <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base">
                {profile.headline}
              </p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-400">
                {profile.title} • <span className="font-medium">{profile.tagline}</span>
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {profile.location}
              </p>
              <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
  Full-stack engineer with a strong frontend focus delivering enterprise applications with React 18 and TypeScript.
  Experienced with .NET 8 / ASP.NET Core and Azure (Functions, Service Bus, Key Vault), and use AI tools (Copilot, Cursor)
  to accelerate spec/plan/build, debugging, refactoring, and test generation.
</p>

              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                className="rounded-xl border border-zinc-300 bg-white dark:bg-zinc-800 dark:border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? "☀️" : "🌙"}
              </button>
              <a
                className="rounded-xl border bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:hover:bg-zinc-200"
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Resume
              </a>
              <a className="rounded-xl border dark:border-zinc-600 px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="rounded-xl border dark:border-zinc-600 px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <CopyEmailButton email={profile.email} />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mt-8 grid gap-8">
          {/* Games */}
          <GamesSection />

          {/* Projects */}
          <section>
            <SectionTitle>Projects</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard
                  key={p.title}
                  title={p.title}
                  description={p.description}
                  tech={p.tech}
                  live={p.links.live}
                  github={p.links.github}
                />
              ))}
            </div>
          </section>

          {/* Live .NET API */}
          <LiveDotNetSection />

          {/* Skills */}
          <section className="rounded-2xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 p-6 shadow-sm transition-colors">
            <SectionTitle>Skills</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="font-medium dark:text-zinc-200">Frontend</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 mt-1">React, TypeScript, Vite, Tailwind, HTML/CSS</p>
              </div>
              <div>
                <p className="font-medium dark:text-zinc-200">Backend</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 mt-1">C#, .NET (Minimal API/Web API), REST, Swagger</p>
              </div>
              <div>
                <p className="font-medium dark:text-zinc-200">Python</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 mt-1">FastAPI, scripting, data processing</p>
              </div>
              <div>
                <p className="font-medium dark:text-zinc-200">Data & Tooling</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-400 mt-1">SQL (Postgres/SQLite), Git, CI/CD, Docker (basic)</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 p-6 shadow-sm transition-colors">
            <SectionTitle>Contact</SectionTitle>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Best way to reach me:{" "}
              <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
              Or connect on{" "}
              <a className="underline" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              .
            </p>
          </section>
        </main>

        <footer className="mt-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </div>
    </div>
  );
}
