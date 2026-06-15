import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { lostItemsTable, foundItemsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { MatchItemBody, AiChatBody } from "@workspace/api-zod";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenAI({ apiKey });
}

router.post("/ai/match-item", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = MatchItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lostItem] = await db.select().from(lostItemsTable).where(eq(lostItemsTable.id, parsed.data.lostItemId));
  if (!lostItem) {
    res.status(404).json({ error: "Lost item not found" });
    return;
  }

  const foundItems = await db.select().from(foundItemsTable).where(eq(foundItemsTable.status, "Found"));
  if (foundItems.length === 0) {
    res.json([]);
    return;
  }

  const ai = getGeminiClient();

  const prompt = `You are an AI assistant for a university Lost & Found system in Bangladesh.

A student lost an item:
Title: ${lostItem.title}
Category: ${lostItem.category}
Description: ${lostItem.description}
Last seen location: ${lostItem.lastSeenLocation ?? "Unknown"}
Date lost: ${lostItem.dateLost ?? "Unknown"}

Compare this lost item against the following found items and return a JSON array of matches with scores.
Only include items with a match score above 20.

Found items:
${foundItems.map((f, i) => `${i + 1}. ID:${f.id} Title:"${f.title}" Category:"${f.category}" Description:"${f.description}" Location:"${f.foundLocation ?? "Unknown"}"`).join("\n")}

Return ONLY a valid JSON array in this exact format (no markdown, no explanation):
[{"foundItemId": <id>, "foundItemTitle": "<title>", "matchScore": <0-100>, "similarity": "<percentage like 85%>", "confidence": "<Low|Medium|High>", "reason": "<brief explanation>"}]

If no matches, return an empty array: []`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "[]";
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const matches = JSON.parse(cleanText);

    // Update lost item with AI matches & notify user
    if (matches.length > 0) {
      await db.update(lostItemsTable).set({
        aiMatches: JSON.stringify(matches),
        status: "Matched",
      }).where(eq(lostItemsTable.id, lostItem.id));

      await db.insert(notificationsTable).values({
        userId: lostItem.reportedBy,
        title: "AI Match Found!",
        message: `Sondhan AI found ${matches.length} potential match(es) for your lost "${lostItem.title}". Check the item details.`,
        type: "ai_match",
      });
    }

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "AI matching failed" });
  }
});

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const ai = getGeminiClient();

  const systemPrompt = `You are Sondhan AI, a helpful assistant for a university Lost & Found platform in Bangladesh. 
You help students, teachers, and staff recover lost items at Bangladeshi universities like BUET, DU, CUET, RUET, NSU, BRAC, AIUB, SUST, and others.

You can answer questions in both English and Bengali (Bangla). Always be helpful, friendly, and concise.

You can help with:
- How to report a lost item
- How to report a found item  
- How to submit a claim for an item
- Understanding the claim verification process
- University policies around lost items
- Tips for finding lost items on campus
- How to use the Sondhan AI platform

If asked in Bengali, respond in Bengali. If asked in English, respond in English.
Keep responses concise (2-4 sentences).`;

  const history = (parsed.data.conversationHistory ?? []).map(m => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.content }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...history,
        { role: "user", parts: [{ text: parsed.data.message }] },
      ],
      config: { maxOutputTokens: 8192 },
    });

    res.json({ reply: response.text ?? "I'm sorry, I couldn't process your request." });
  } catch {
    res.status(500).json({ error: "AI chat failed" });
  }
});

export default router;
