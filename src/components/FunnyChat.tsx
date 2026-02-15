import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "bot"; text: string };

const INITIAL_MESSAGE: Message = {
  role: "bot",
  text: "Hey! I'm the portfolio AI. Ask me about Leyli, the projects, games, or anything. I'm powered by GPT.",
};

async function fetchReply(messages: Message[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data.reply ?? "I didn't get a reply. Try again?";
}

export default function FunnyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMessage: Message = { role: "user", text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const reply = await fetchReply(nextMessages);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Something went wrong. (AI chat works when deployed to Vercel with OPENAI_API_KEY set.)";
      setMessages((m) => [...m, { role: "bot", text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition hover:scale-105 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        title="Chat with the portfolio AI"
        aria-label="Open chat"
      >
        <span className="text-2xl" aria-hidden>💬</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <span className="font-semibold dark:text-zinc-100">Portfolio AI</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-700 dark:text-zinc-200">
                  …
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-zinc-200 p-3 dark:border-zinc-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say something..."
                disabled={loading}
                className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-500"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Send
              </button>
            </div>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Powered by OpenAI. Ask about the portfolio, Leyli, or jobs.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
