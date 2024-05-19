import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth/auth";
import { emailRouter } from "./routes/emails";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Use built-in Express body parser

const corsOpts = {
  origin: "*", // Make sure to restrict this in production
  methods: ["GET", "POST"],
};

app.use(cors(corsOpts));

// Route to exchange authorization code for access token
app.use("/auth", authRouter);
app.use("/ai", aiRouter);

// Route to fetch Gmail inbox using the access token provided by the client
app.use("/emails", emailRouter);

// Fetch email details in batch from Gmail API

// Example code to start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// import axios, { AxiosResponse } from "axios";
// import cors from "cors";
// import dotenv from "dotenv";
// import express, { Request, Response } from "express";
// import { parseMultipartResponse } from "./utils";

// dotenv.config(); // Load environment variables from .env file

// const app = express();
// app.use(express.json()); // Use built-in Express body parser

// const corsOpts = {
//   origin: "*", // Make sure to restrict this in production
//   methods: ["GET", "POST"],
// };

// app.use(cors(corsOpts));

// interface AuthRequest extends Request {
//   body: {
//     code: string;
//   };
// }

// interface EmailRequest extends Request {
//   headers: {
//     authorization: string;
//   };
// }

// interface Email {
//   id: string;
//   threadId: string;
//   sender: string;
//   snippet: string;
//   subject: string;
//   date: string;
//   labels: string[];
// }

// interface EmailResponse {
//   emails: Email[];
//   nextPageToken: string | undefined;
//   resultSizeEstimate: number;
// }

// // Route to exchange authorization code for access token
// app.post("/auth/google", async (req: AuthRequest, res: Response) => {
//   const { code } = req.body;

//   try {
//     const response = await axios.post(
//       "https://oauth2.googleapis.com/token",
//       null,
//       {
//         params: {
//           code,
//           client_id: process.env.GOOGLE_CLIENT_ID,
//           client_secret: process.env.GOOGLE_CLIENT_SECRET,
//           redirect_uri: process.env.REDIRECT_URI,
//           grant_type: "authorization_code",
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error("OAuth error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Route to fetch Gmail inbox using the access token provided by the client
// app.get("/emails/inbox", async (req: Request, res: Response) => {
//   const accessToken = (req as EmailRequest).headers.authorization?.split(
//     " "
//   )[1];
//   const pageToken = req.query.pageToken as string | undefined;

//   try {
//     const emailDetails: Email[] = [];
//     let nextPageToken = pageToken;

//     while (emailDetails.length < 50) {
//       const listResponse = await axios.get(
//         "https://gmail.googleapis.com/gmail/v1/users/me/messages",
//         {
//           params: {
//             maxResults: 100, // Fetch more emails per page
//             pageToken: nextPageToken || undefined,
//           },
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       const messageIds: string[] = listResponse.data.messages.map(
//         (message: any) => message.id
//       );

//       // Split messageIds into smaller batches to fetch in parallel
//       const batchSize = 50; // Size of each batch request
//       const batches = [];
//       for (let i = 0; i < messageIds.length; i += batchSize) {
//         const batch = messageIds.slice(i, i + batchSize);
//         batches.push(batch);
//       }

//       const batchPromises = batches.map((batch) =>
//         fetchBatchEmailDetails(accessToken, batch)
//       );
//       const batchResults = await Promise.all(batchPromises);

//       // Flatten the array of arrays
//       batchResults.forEach((result) => emailDetails.push(...result));

//       nextPageToken = listResponse.data.nextPageToken;
//       if (!nextPageToken || emailDetails.length >= 50) {
//         break;
//       }
//     }

//     // Ensure we only return up to 50 emails
//     const limitedEmailDetails = emailDetails.slice(0, 50);

//     // Group emails by threadId
//     const groupedEmails = limitedEmailDetails.reduce((acc: any, email) => {
//       if (!acc[email.threadId]) {
//         acc[email.threadId] = [];
//       }
//       acc[email.threadId].push(email);
//       return acc;
//     }, {});

//     res.json({
//       groupedEmails,
//       nextPageToken,
//       resultSizeEstimate: emailDetails.length,
//     });
//   } catch (error) {
//     console.error("Gmail API error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Fetch email details in batch from Gmail API
// const fetchBatchEmailDetails = async (
//   accessToken: string,
//   emailIds: string[]
// ): Promise<Email[]> => {
//   const boundary = "batch_boundary";

//   const body =
//     emailIds
//       .map((id) => {
//         return [
//           `--${boundary}`,
//           "Content-Type: application/http",
//           "",
//           `GET /gmail/v1/users/me/messages/${id}?fields=id,threadId,labelIds,snippet,payload(headers)`,
//           "",
//         ].join("\r\n");
//       })
//       .join("\r\n") + `\r\n--${boundary}--`;

//   const response: AxiosResponse<any> = await axios.post(
//     "https://www.googleapis.com/batch/gmail/v1",
//     body,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": `multipart/mixed; boundary=${boundary}`,
//       },
//     }
//   );

//   const rawResponse = response.data;
//   console.log("Raw batch response:", rawResponse);

//   const emailDetails = parseMultipartResponse(rawResponse)
//     .map((message: any) => {
//       if (!message.payload || !message.payload.headers) {
//         console.error("Missing payload or headers in message:", message);
//         return null;
//       }

//       const headers = message.payload.headers;
//       const subjectHeader = headers.find((h: any) => h.name === "Subject");
//       const dateHeader = headers.find((h: any) => h.name === "Date");
//       const sender =
//         headers
//           .find((h: any) => h.name === "From")
//           ?.value.replace(/<.*>/, "")
//           .replace(/"/g, "")
//           .trim() || "Unknown Sender";
//       return {
//         id: message.id,
//         threadId: message.threadId,
//         sender,
//         snippet: message.snippet,
//         subject: subjectHeader ? subjectHeader.value : "",
//         date: dateHeader ? dateHeader.value : "",
//         labels: message.labelIds,
//       } as Email;
//     })
//     .filter((email): email is Email => email !== null);

//   return emailDetails;
// };

// // Example code to start the server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
