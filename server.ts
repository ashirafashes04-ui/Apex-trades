import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ApexTrades Terminal Engine" });
});

// AI Trading Assistant Endpoint
app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      res.json({
        reply: getFallbackAssistantReply(message, context),
        source: "simulated_assistant"
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are an intelligent trading assistant built into this synthetic markets derivatives & binary options trading platform.

Guidelines:
1. Provide concise, clear, educational, and professional answers tailored for mobile users.
2. Explain trading concepts like Rise/Fall, Matches/Differs, Even/Odd, Over/Under, Volatility Indices (e.g. Volatility 10 (1s), Volatility 100 (1s)), ticks, and payout percentages clearly.
3. If the user asks about their demo account stats, balance, or open trades, refer to the provided session context:
   - Balance: $${context?.balance ?? "10,000.00"} (DEMO Account)
   - Active Market: ${context?.market ?? "Volatility 10 (1s)"}
   - Active Contract Type: ${context?.contractType ?? "Rise/Fall"}
   - Open Trades Count: ${context?.openTradesCount ?? 0}
   - Closed Trades Count: ${context?.closedTradesCount ?? 0}
4. CLEARLY emphasize that all trading in default mode is simulated demo trading with synthetic algorithms and not financial advice.
5. Keep responses structured with short bullet points or concise paragraphs suitable for phone screens.
`;

    // Try primary model (gemini-3.6-flash), fallback to gemini-3.5-flash-lite if busy/503
    const modelsToTry = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];
    let replyText = "";
    let usedModel = "";

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response?.text) {
          replyText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or unavailable (code: ${err?.status || err?.code}): ${err?.message}`);
        // Continue to next fallback model
      }
    }

    if (replyText) {
      res.json({
        reply: replyText,
        source: usedModel
      });
    } else {
      res.json({
        reply: getFallbackAssistantReply(message, context),
        source: "fallback_rule_engine"
      });
    }
  } catch (error: any) {
    console.error("AI Assistant Endpoint Error:", error);
    res.json({
      reply: getFallbackAssistantReply(req.body?.message || "", req.body?.context),
      source: "fallback_on_error",
      errorDetails: error?.message
    });
  }
});

function getFallbackAssistantReply(query: string, context: any): string {
  const lower = query.toLowerCase();
  
  if (lower.includes("rise/fall") || lower.includes("rise fall")) {
    return "📈 **Rise/Fall Contracts Explained**:\n- **Rise**: You win if the exit price is strictly higher than the entry price at expiry.\n- **Fall**: You win if the exit price is strictly lower than the entry price at expiry.\n- Typical payout: **98%** profit on successful trades.";
  }
  if (lower.includes("matches/differs") || lower.includes("match")) {
    return "🎯 **Matches/Differs Contracts**:\n- **Matches**: Predict the exact last digit of the price (Payout: 890%).\n- **Differs**: Predict that the last digit will NOT match your selected digit (Payout: 10%).";
  }
  if (lower.includes("even/odd") || lower.includes("even") || lower.includes("odd")) {
    return "🔢 **Even/Odd Contracts**:\n- **Even**: Win if the last digit of the exit tick is 0, 2, 4, 6, or 8.\n- **Odd**: Win if the last digit of the exit tick is 1, 3, 5, 7, or 9.\n- Payout: **98%**.";
  }
  if (lower.includes("over/under") || lower.includes("over")) {
    return "📊 **Over/Under Contracts**:\n- **Over**: Win if the last digit is strictly greater than your threshold.\n- **Under**: Win if the last digit is strictly less than your threshold.";
  }
  if (lower.includes("synthetic") || lower.includes("volatility")) {
    return "⚡ **Synthetic Indices** simulate continuous market volatility independent of real-world stock market opening hours. Volatility 10 (1s) updates every 1 second with 10% constant volatility.";
  }
  if (lower.includes("balance") || lower.includes("stats") || lower.includes("trade")) {
    return `💰 **Your Account Overview**:\n- Current Demo Balance: **$${context?.balance ?? "10,000.00"}**\n- Open Positions: **${context?.openTradesCount ?? 0}**\n- Historical Closed Trades: **${context?.closedTradesCount ?? 0}**\n- Active Market: **${context?.market ?? "Volatility 10 (1s)"}**`;
  }
  
  return `👋 **Welcome to ApexAI Trading Assistant**!\n\nI can help you understand synthetic contract types, analyze your current demo performance ($${context?.balance ?? "10,000.00"} demo balance), or master trading strategies. Ask me anything about Rise/Fall, Even/Odd, or Volatility Indices!`;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ApexTrades Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
