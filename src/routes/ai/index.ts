import axios from "axios";
import express, { Request, Response } from "express";

export const aiRouter = express.Router();
aiRouter.use("/emails/summary", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: "what are humans?",
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer sk-proj-8Wez9pLkHP3pp3jtPcYxT3BlbkFJC6cNIGU5y387x19D2qWr`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error });
  }
});
