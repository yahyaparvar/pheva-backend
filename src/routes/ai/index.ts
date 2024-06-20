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
  const prompt = `Provide information about Iran in a single, continuous string and 3 lines. without any numbering, special formatting, line breaks, or extra spaces, ensuring the text is suitable for direct rendering in a frontend application without any errors.`;

  // Simulated response data
  const simulatedResponse = [
    "Iran",
    "is",
    "a",
    "country",
    "in",
    "Western",
    "Asia.",
    "It",
    "is",
    "known",
    "for",
    "its",
    "rich",
    "cultural",
    "heritage,",
    "significant",
    "contributions",
    "to",
    "art,",
    "science,",
    "and",
    "literature.",
    "The",
    "capital",
    "of",
    "Iran",
    "is",
    "Tehran,",
    "which",
    "is",
    "also",
    "the",
    "largest",
    "city",
    "in",
    "the",
    "country.",
    "The",
    "official",
    "language",
    "is",
    "Persian,",
    "and",
    "the",
    "currency",
    "is",
    "the",
    "Iranian",
    "rial.",
    "Iran",
    "has",
    "a",
    "diverse",
    "climate",
    "and",
    "is",
    "home",
    "to",
    "a",
    "variety",
    "of",
    "ecosystems,",
    "including",
    "mountains,",
    "deserts,",
    "and",
    "forests.",
    "The",
    "country",
    "has",
    "a",
    "population",
    "of",
    "over",
    "83",
    "million",
    "people.",
  ];
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const part of simulatedResponse) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
      res.write(`${part} `); // Sending chunk of text
    }

    res.write("##END##");
    res.end();
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});
aiRouter.post("/emailsDetails/negativeAnswer", async (req, res) => {
  const { prompt: userPrompt, name } = req.body;
  const prompt = `Provide information about Iran in a single, continuous string and 3 lines. without any numbering, special formatting, line breaks, or extra spaces, ensuring the text is suitable for direct rendering in a frontend application without any errors.`;

  // Simulated response data
  const simulatedResponse = [
    "Iran",
    "is",
    "a",
    "country",
    "in",
    "Western",
    "Asia.",
    "It",
    "is",
    "known",
    "for",
    "its",
    "rich",
    "cultural",
    "heritage,",
    "significant",
    "contributions",
    "to",
    "art,",
    "science,",
    "and",
    "literature.",
    "The",
    "capital",
    "of",
    "Iran",
    "is",
    "Tehran,",
    "which",
    "is",
    "also",
    "the",
    "largest",
    "city",
    "in",
    "the",
    "country.",
    "The",
    "official",
    "language",
    "is",
    "Persian,",
    "and",
    "the",
    "currency",
    "is",
    "the",
    "Iranian",
    "rial.",
    "Iran",
    "has",
    "a",
    "diverse",
    "climate",
    "and",
    "is",
    "home",
    "to",
    "a",
    "variety",
    "of",
    "ecosystems,",
    "including",
    "mountains,",
    "deserts,",
    "and",
    "forests.",
    "The",
    "country",
    "has",
    "a",
    "population",
    "of",
    "over",
    "83",
    "million",
    "people.",
  ];
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const part of simulatedResponse) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
      res.write(`${part} `); // Sending chunk of text
    }

    res.write("##END##");
    res.end();
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});
aiRouter.post("/emailsDetails/positiveAnswer", async (req, res) => {
  const { prompt: userPrompt, name } = req.body;
  const prompt = `Provide information about Iran in a single, continuous string and 3 lines. without any numbering, special formatting, line breaks, or extra spaces, ensuring the text is suitable for direct rendering in a frontend application without any errors.`;

  // Simulated response data
  const simulatedResponse = [
    "Iran",
    "is",
    "a",
    "country",
    "in",
    "Western",
    "Asia.",
    "It",
    "is",
    "known",
    "for",
    "its",
    "rich",
    "cultural",
    "heritage,",
    "significant",
    "contributions",
    "to",
    "art,",
    "science,",
    "and",
    "literature.",
    "The",
    "capital",
    "of",
    "Iran",
    "is",
    "Tehran,",
    "which",
    "is",
    "also",
    "the",
    "largest",
    "city",
    "in",
    "the",
    "country.",
    "The",
    "diverse",
    "climate",
    "and",
    "is",
    "home",
    "to",
    "a",
    "variety",
    "of",
    "ecosystems,",
    "including",
    "mountains,",
    "deserts,",
    "and",
    "forests.",
    "The",
    "country",
    "has",
    "a",
    "population",
    "of",
    "over",
    "83",
    "million",
    "people.",
  ];
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const part of simulatedResponse) {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
      res.write(`${part} `); // Sending chunk of text
    }

    res.write("##END##");
    res.end();
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});

// aiRouter.post("/emailsDetails/summary", async (req, res) => {
//   const { prompt: userPrompt, name } = req.body;
//   const prompt = `Provide information about Iran in a single, continuous string and 3 lines. without any numbering, special formatting, line breaks, or extra spaces, ensuring the text is suitable for direct rendering in a frontend application without any errors.`;

//   try {
//     const aiResponse = await openai.chat.completions.create({
//       messages: [{ role: "system", content: prompt }],
//       model: "gpt-3.5-turbo",
//       stream: true,
//     });
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     for await (const part of aiResponse) {
//       let streamText = part.choices[0]?.delta?.content || "";
//       if (streamText) {
//         res.write(`${streamText}`);
//       }
//     }

//     res.write("##END##");
//     res.end();
//   } catch (error) {
//     console.error("Error fetching AI response:", error);
//     res.status(500).json({ error: error });
//   }
// });
// aiRouter.post("/emails/summary", async (req, res) => {
//   const { prompt: userPrompt, name } = req.body;
//   const prompt = `
//   Summarize the following emails in two sentences each:
//   {emails: ${JSON.stringify(userPrompt, null, 0)}}

//   Instructions:
//   - Translate non-English emails to English.
//   - Include key info from the snippet and sender, without repeating the subject.
//   - Return only the email ID and summary in JSON format with the key "emails".
//   - Summarize all emails (SUPER IMPORTANT)
//   - Summaries must be two lines
//   - User's name is ${name} so whenever you saw an email with that name, Put You instead of his name
//   - Example of above instruction: You have a job update/YOUR subscription is canceled
//   Example output:
//   {
//     "emails": [
//       {
//         "id": "email id",
//         "summary": "Concise summary in two sentences."
//       }
//     ]
//   }
//   `;

//   try {
//     const gptResponse = await openai.chat.completions.create({
//       messages: [{ role: "system", content: prompt }],
//       model: "gpt-3.5-turbo",
//     });

//     res.json({ summaries: gptResponse.choices[0].message.content });
//   } catch (error) {
//     console.error("Error fetching AI response:", error);
//     res.status(500).json({ error: error });
//   }
// });
