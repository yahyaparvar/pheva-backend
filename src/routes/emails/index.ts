import axios from "axios";
import express, { Request, Response } from "express";
import {
  EmailRequest,
  EmailResponse,
  fetchBatchEmailDetails,
} from "./constants";

export const emailRouter = express.Router();
emailRouter.get("/inbox", async (req: Request, res: Response) => {
  const accessToken = (req as EmailRequest).headers.authorization?.split(
    " "
  )[1];
  const pageToken = req.query.pageToken as string | undefined;

  try {
    const listResponse = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      {
        params: {
          maxResults: 24,
          pageToken: pageToken || undefined,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    const messageIds: string[] = listResponse.data.messages.map(
      (message: any) => message.id
    );

    // Fetch email details in batch from Gmail API
    const emailDetails = await fetchBatchEmailDetails(accessToken, messageIds);

    const result: EmailResponse = {
      emails: emailDetails,
      nextPageToken: listResponse.data.nextPageToken,
      resultSizeEstimate: listResponse.data.resultSizeEstimate,
    };

    res.json(result);
  } catch (error: any) {
    console.error("Gmail API error:", error);

    if (error.response && error.response.status === 401) {
      res.status(401).json({ error: "Unauthorized: Token expired or invalid" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
