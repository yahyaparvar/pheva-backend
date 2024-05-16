import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],
};

app.use(cors(corsOpts));

interface GoogleAuthRequest extends Request {
  body: {
    code: string;
  };
}

app.post("/auth/google", async (req: GoogleAuthRequest, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
