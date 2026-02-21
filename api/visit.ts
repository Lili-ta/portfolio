import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) {
    return res.status(200).json({ count: null, message: "Database not configured." });
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("portfolio");
    const collection = db.collection<{ _id: string; Count: number; LastUpdated: Date }>("stats");
    const result = await collection.findOneAndUpdate(
      { _id: "site" },
      { $inc: { Count: 1 }, $set: { LastUpdated: new Date() } },
      { upsert: true, returnDocument: "after" }
    );
    await client.close();
    const count = result?.Count ?? 0;
    return res.status(200).json({ count, database: "MongoDB" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("MongoDB visit error:", message);
    return res.status(500).json({ error: message });
  }
}
