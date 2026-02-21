import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

const DEFAULT_HIGHLIGHTS = [
  { Order: 1, Title: "Engineering leadership", Text: "Led engineering teams at PwC and CoinFlip; managed 3 teams and delivery across products." },
  { Order: 2, Title: "Quality & scale", Text: "Drove 85%+ test coverage and CI/CD at CoinFlip; built reliable systems at JPMorgan." },
  { Order: 3, Title: "Full-stack", Text: "React, TypeScript, .NET 8, MongoDB — this portfolio is a live example (API on Railway, DB in Atlas)." },
  { Order: 4, Title: "Finance & compliance", Text: "Experience in fintech and regulated environments (PwC, CoinFlip, JPMorgan)." },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) {
    return res.status(200).json({ highlights: null, message: "Database not configured." });
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("portfolio");
    const collection = db.collection<{ _id: string; Items: { Title: string; Text: string; Order: number }[] }>("content");
    let doc = await collection.findOne({ _id: "highlights" });
    if (!doc?.Items?.length) {
      await collection.insertOne({
        _id: "highlights",
        Items: DEFAULT_HIGHLIGHTS,
      });
      doc = { _id: "highlights", Items: DEFAULT_HIGHLIGHTS };
    }
    await client.close();
    const highlights = doc.Items.sort((a, b) => a.Order - b.Order).map(({ Title, Text }) => ({ title: Title, text: Text }));
    return res.status(200).json({ highlights, source: "MongoDB" });
  } catch (err) {
    console.error("MongoDB highlights error:", err);
    return res.status(500).json({ highlights: null, error: err instanceof Error ? err.message : "Database error" });
  }
}
