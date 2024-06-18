import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { Email } from "./../emails/constants";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const aiRouter = express.Router();
aiRouter.post("/emails/summary", async (req, res) => {
  const { prompt: userPrompt, name } = req.body;
  try {
    const summaries = userPrompt.map((email: Email) => ({
      id: email.id,
      summary: email.subject,
    }));
    setTimeout(() => {
      res.json({ emails: summaries });
    }, 2000);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});
aiRouter.post("/emailsDetails/summary", async (req, res) => {
  const { prompt: userPrompt, name } = req.body;
  const prompt = `give me info about iran in 1 line`;

  try {
    const aiResponse = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
      stream: true,
    });
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const part of aiResponse) {
      let streamText = part.choices[0]?.delta?.content || "";
      if (streamText) {
        res.write(`${streamText}`);
      }
    }

    res.write("##END##");
    res.end();
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});