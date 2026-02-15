import { useState, useCallback } from "react";

const EMOJIS = ["🎯", "🎨", "🚀", "⚡", "🌟", "🎲", "🔮", "🎪"];
const PAIRS = [...EMOJIS, ...EMOJIS];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function MemoryMatch() {
  const [cards, setCards] = useState(() => shuffle(PAIRS.map((e, i) => ({ id: i, emoji: e }))));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);

  const handleFlip = useCallback(
    (idx: number) => {
      if (flipped.length === 2 || flipped.includes(idx) || matched.has(idx)) return;
      const next = [...flipped, idx];
      setFlipped(next);
      setMoves((m) => m + 1);
      if (next.length === 2) {
        const [a, b] = next;
        if (cards[a].emoji === cards[b].emoji) {
          setMatched((m) => new Set([...m, a, b]));
          setFlipped([]);
        } else {
          setTimeout(() => setFlipped([]), 600);
        }
      }
    },
    [cards, flipped, matched]
  );

  const fullReset = () => {
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setCards(shuffle(PAIRS.map((e, i) => ({ id: i, emoji: e }))));
  };

  const allMatched = matched.size === PAIRS.length;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-600">Moves: {moves}</span>
        {allMatched && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            You won!
          </span>
        )}
        <button
          type="button"
          onClick={fullReset}
          className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          New game
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          return (
            <button
              key={`${card.emoji}-${idx}`}
              type="button"
              onClick={() => handleFlip(idx)}
              disabled={allMatched}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-zinc-200 bg-zinc-50 text-2xl transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 disabled:pointer-events-none"
              style={{
                transform: isFlipped ? "rotateY(0deg)" : undefined,
                backgroundColor: isFlipped ? "white" : undefined,
              }}
            >
              {isFlipped ? card.emoji : "?"}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500">
        Find all matching pairs. Fewer moves = better!
      </p>
    </div>
  );
}
