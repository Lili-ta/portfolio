import { useState, useRef, useCallback } from "react";

type Phase = "idle" | "wait" | "go" | "tooSoon" | "result";

export default function ReactionTime() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState<number | null>(null);
  const [recent, setRecent] = useState<number[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const start = useCallback(() => {
    setPhase("wait");
    setMs(null);
    const delay = 1500 + Math.random() * 2500;
    timeoutRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
      timeoutRef.current = null;
    }, delay);
  }, []);

  const click = useCallback(() => {
    if (phase === "wait") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setPhase("tooSoon");
      return;
    }
    if (phase === "go") {
      const elapsed = Math.round(performance.now() - startRef.current);
      setMs(elapsed);
      setRecent((r) => [elapsed, ...r].slice(0, 5));
      setPhase("result");
    }
  }, [phase]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setPhase("idle");
    setMs(null);
  }, []);

  const bg =
    phase === "go"
      ? "bg-emerald-500"
      : phase === "tooSoon"
        ? "bg-rose-500"
        : phase === "result"
          ? "bg-zinc-100"
          : "bg-amber-400";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 text-center text-sm font-medium text-zinc-600">
        {phase === "idle" && "Click to start, then click when the screen turns green."}
        {phase === "wait" && "Wait for green…"}
        {phase === "go" && "Click now!"}
        {phase === "tooSoon" && "Too soon! Click to try again."}
        {phase === "result" && `Your time: ${ms} ms`}
      </div>
      <button
        type="button"
        onClick={phase === "idle" || phase === "tooSoon" ? start : phase === "result" ? reset : click}
        className={`block w-full rounded-xl py-12 text-lg font-semibold text-white transition-colors ${bg} hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2`}
      >
        {phase === "idle" && "Start"}
        {phase === "wait" && "Wait…"}
        {phase === "go" && "Click!"}
        {phase === "tooSoon" && "Try again"}
        {phase === "result" && "Play again"}
      </button>
      {recent.length > 0 && (
        <div className="mt-3 text-center text-xs text-zinc-500">
          Recent: {recent.join(" ms, ")} ms
        </div>
      )}
    </div>
  );
}
