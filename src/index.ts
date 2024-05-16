import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Use built-in Express body parser

const corsOpts = {
  origin: "*", // Make sure to restrict this in production
  methods: ["GET", "POST"],
};

app.use(cors(corsOpts));

interface AuthRequest extends Request {
  body: {
    code: string;
  };
}

interface EmailRequest extends Request {
  headers: {
    authorization: string;
  };
}

// Route to exchange authorization code for access token
app.post("/auth/google", async (req: AuthRequest, res: Response) => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          grant_type: "authorization_code",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New route to fetch Gmail inbox using the access token provided by the client
app.get("/emails/inbox", async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  try {
    const listResponse = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?fields=messages(id)&maxResults=50",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    const messages = await Promise.all(
      listResponse.data.messages.map(async (message: any) => {
        const messageResponse = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?fields=id,labelIds,snippet,payload(headers)`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );
        const headers = messageResponse.data.payload.headers;
        const subjectHeader = headers.find((h: any) => h.name === "Subject");
        const dateHeader = headers.find((h: any) => h.name === "Date");
        return {
          id: message.id,
          snippet: messageResponse.data.snippet,
          subject: subjectHeader ? subjectHeader.value : "",
          date: dateHeader ? dateHeader.value : "",
          labels: messageResponse.data.labelIds,
        };
      })
    );

    res.json({ messages });
  } catch (error) {
    console.error("Gmail API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
