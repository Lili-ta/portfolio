import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a witty, friendly AI chatbot on a software engineer's portfolio site. Your role is to chat with visitors (recruiters, developers, curious people) in a fun but professional way.

Keep responses short (1-3 sentences). Be helpful and occasionally funny. You can mention:
- The portfolio owner is open to job opportunities (suggest using Email or LinkedIn from the page).
- The site has games (Memory Match, Snake, Reaction Time), a .NET API ("Live from .NET" section), and is built with React + TypeScript.
- You're the portfolio's AI assistant.

Don't be mean, don't give medical/legal/financial advice, and don't pretend to be human. It's fine to say you're an AI. Stay on topic and concise.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "AI chat is not configured. Add OPENAI_API_KEY in Vercel.",
    });
  }

  const body = req.body as { messages?: { role: string; text: string }[] };
  const messages = body?.messages ?? [];

  const openai = new OpenAI({ apiKey });

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.text,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      max_tokens: 150,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "I’m not sure what to say. Try again?";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({
      error: "Something went wrong with the AI. Try again in a moment.",
    });
  }
}
