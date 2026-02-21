import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) {
    return res.status(200).json({
      database: null,
      status: "none",
      message: "Set MONGODB_URI to use MongoDB (NoSQL).",
    });
  }
  return res.status(200).json({
    database: "MongoDB",
    status: "connected",
    type: "NoSQL",
  });
}
