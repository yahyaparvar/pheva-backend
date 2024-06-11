import axios from "axios";
import express, { Response } from "express";
import { AuthRequest } from "./constants";
export const authRouter = express.Router();
authRouter.post("/google", async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ error: `"OAuth error:", ${error}` });
  }
});

authRouter.post("/refresh-token", async (req: AuthRequest, res: Response) => {
  const { code: refreshToken } = req.body;

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        },
      }
    );

    const { access_token, expires_in } = response.data;

    res.json({
      accessToken: access_token,
      expiresIn: expires_in,
    });
  } catch (error) {
    res.status(500).json({ error: `"OAuth error:", ${error}` });
  }
});
export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const response = await axios.post(
    "https://oauth2.googleapis.com/token",
    null,
    {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
    }
  );

  return response.data.access_token;
}
