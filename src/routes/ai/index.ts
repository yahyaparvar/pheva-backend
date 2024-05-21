import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const aiRouter = express.Router();
aiRouter.post("/emails/summary", async (req, res) => {
  const { prompt: userPrompt, name } = req.body;
  const prompt = `
  Summarize the following emails in two sentences each:
  {emails: ${JSON.stringify(userPrompt, null, 0)}}

  Instructions:
  - Translate non-English emails to English.
  - Include key info from the snippet and sender, without repeating the subject.
  - Return only the email ID and summary in JSON format with the key "emails".
  - Summarize all emails (SUPER IMPORTANT)
  - Summaries must be two lines
  - User's name is ${name} so whenever you saw an email with that name, Put You instead of his name
  - Example of above instruction: You have a job update/YOUR subscription is canceled
  Example output:
  {
    "emails": [
      {
        "id": "email id",
        "summary": "Concise summary in two sentences."
      }
    ]
  }
  `;

  try {
    const gptResponse = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    res.json({ summaries: gptResponse.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ error: error });
  }
});
// import dotenv from "dotenv";
// import express from "express";
// import OpenAI from "openai";

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const aiRouter = express.Router();

// aiRouter.post("/emails/summary", async (req, res) => {
//   const { prompt: userPrompt, name } = req.body;

//   // Preprocess userPrompt to remove date and labels from each email
//   const preprocessedEmails = userPrompt.map((email: any) => {
//     const { id, sender, snippet, subject } = email;
//     return { id, sender, snippet, subject };
//   });

//   const prompt = `
//   Summarize the following emails in two sentences each:
//   {emails: ${JSON.stringify(preprocessedEmails)}}

//   Instructions:
//   - Translate non-English emails to English.
//   - Include key info from the snippet and sender, without repeating the subject.
//   - Return only the email ID and summary in JSON format with the key "emails".
//   - Summarize all emails (SUPER IMPORTANT)
//   - Summaries must be two lines.
//   - User's name is ${name} so whenever you saw an email with that name, put "You" instead of his name.
//   - Example of above instruction: You have a job update/YOUR subscription is canceled.

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
//     // Measure start time for performance monitoring
//     const startTime = Date.now();

//     const gptResponse: OpenAI.Chat.Completions.ChatCompletion =
//       await openai.chat.completions.create({
//         messages: [{ role: "system", content: prompt }],
//         model: "gpt-3.5-turbo",
//       });

//     // Use optional chaining to safely access the content
//     const content = gptResponse.choices[0]?.message?.content ?? "";
//     const summaries = JSON.parse(content);

//     // Measure end time and log duration
//     const endTime = Date.now();
//     console.log(`API call duration: ${endTime - startTime} ms`);

//     res.json({ emails: summaries.emails });
//   } catch (error) {
//     console.error("Error fetching AI response:", error);
//     res.status(500).json({ error: error });
//   }
// });
