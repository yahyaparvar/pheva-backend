import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const aiRouter = express.Router();
aiRouter.post("/emails/summary", async (req, res) => {
  const { prompt: userPrompt } = req.body;
  const prompt = `this is my user input ${userPrompt}`;
  try {
    const gptResponse = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    res.json(gptResponse);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});
