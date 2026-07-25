import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "ISO Digital Library Management System", timestamp: new Date().toISOString() });
  });

  // Server-side Gemini AI Search Assistant endpoint
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const { query, recordsContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is not configured on the server."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const systemInstruction = `
You are the AI Intelligence Assistant for the International Sadat Organization (ISO) Digital Library Management System.
The Super Administrator of ISO is Syed Muhammad Aamir Naqvi Al Qadari, Chairman IT Support Council (Contact: 03323475431).

Your job is to answer user queries based on ISO organizational data, members, office bearers, hierarchy, statistics, and records.
Provide direct, respectful, clear, well-formatted responses in markdown with bullet points, counts, or table summaries when applicable.

Context data provided:
${JSON.stringify(recordsContext || {})}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: query || "Summarize the ISO organization statistics and office bearers.",
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      return res.json({
        answer: response.text || "No response generated from AI Assistant."
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.status(500).json({
        error: err.message || "Failed to query Gemini AI Search Assistant."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ISO Digital Library Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
