import { useState, useCallback, useRef, useEffect } from "react";

const GRID = 16;
const CELL = 20;
const INITIAL_SNAKE: [number, number][] = [[8, 8], [7, 8], [6, 8]];
const DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function randomFood(snake: [number, number][]): [number, number] {
  let x: number, y: number;
  const set = new Set(snake.map(([a, b]) => `${a},${b}`));
  do {
    x = Math.floor(Math.random() * GRID);
    y = Math.floor(Math.random() * GRID);
  } while (set.has(`${x},${y}`));
  return [x, y];
}

export default function Snake() {
  const [snake, setSnake] = useState<[number, number][]>(INITIAL_SNAKE);
  const [food, setFood] = useState<[number, number]>(() => randomFood(INITIAL_SNAKE));
  const [, setDir] = useState<[number, number]>([1, 0]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playing, setPlaying] = useState(false);
  const tickRef = useRef<number | null>(null);
  const dirRef = useRef<[number, number]>([1, 0]);

  const reset = useCallback(() => {
    const start = [...INITIAL_SNAKE];
    setSnake(start);
    setFood(randomFood(start));
    setDir([1, 0]);
    dirRef.current = [1, 0];
    setScore(0);
    setGameOver(false);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing || gameOver) return;
    const run = () => {
      setSnake((prev) => {
        const [hx, hy] = prev[0];
        const [dx, dy] = dirRef.current;
        const nx = (hx + dx + GRID) % GRID;
        const ny = (hy + dy + GRID) % GRID;
        if (prev.some(([x, y]) => x === nx && y === ny)) {
          setGameOver(true);
          setPlaying(false);
          return prev;
        }
        const next = [[nx, ny] as [number, number], ...prev];
        if (nx === food[0] && ny === food[1]) {
          setScore((s) => s + 10);
          setFood(randomFood(next));
          return next;
        }
        next.pop();
        return next;
      });
    };
    tickRef.current = window.setInterval(run, 120);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [playing, gameOver, food]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = DIRECTIONS[e.key];
      if (!d) return;
      e.preventDefault();
      const [dx, dy] = d;
      const [cdx, cdy] = dirRef.current;
      if (dx === -cdx && dy === -cdy) return;
      dirRef.current = [dx, dy];
      setDir([dx, dy]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const head = snake[0];
  const bodySet = new Set(snake.map(([x, y]) => `${x},${y}`));
  const foodKey = `${food[0]},${food[1]}`;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-600">Score: {score}</span>
        {gameOver && (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-800">
            Game over
          </span>
        )}
        {!playing && !gameOver && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-zinc-300 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Start
          </button>
        )}
        {(gameOver || (playing && !gameOver)) && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Restart
          </button>
        )}
      </div>
      <div
        className="relative mx-auto rounded-xl border-2 border-zinc-200 bg-zinc-50"
        style={{ width: GRID * CELL, height: GRID * CELL }}
      >
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const key = `${x},${y}`;
          const isHead = head[0] === x && head[1] === y;
          const isBody = bodySet.has(key) && !isHead;
          const isFood = key === foodKey;
          return (
            <div
              key={key}
              className="absolute rounded-sm"
              style={{
                left: x * CELL,
                top: y * CELL,
                width: CELL - 2,
                height: CELL - 2,
                backgroundColor: isHead
                  ? "rgb(24 24 27)"
                  : isBody
                    ? "rgb(63 63 70)"
                    : isFood
                      ? "rgb(239 68 68)"
                      : "transparent",
              }}
            />
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500">
        Use arrow keys to move. Eat the red dot, don&apos;t hit yourself!
      </p>
    </div>
  );
}
