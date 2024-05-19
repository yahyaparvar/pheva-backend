import axios from "axios";
import express from "express";

export const aiRouter = express.Router();
aiRouter.post("/emails/summary", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});
