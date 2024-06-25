import axios from "axios";
import express, { Request, Response } from "express";
import { refreshAccessToken } from "../auth/auth";
import { fetchBatchEmailDetails } from "../emails/constants";

export const emailRouter = express.Router();

emailRouter.get("/inbox", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];
  const pageToken = req.query.pageToken as string | undefined;

  async function getInboxEmails(token: string) {
    const listResponse = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      {
        params: {
          maxResults: 24,
          pageToken: pageToken || undefined,
          q: 'in:"inbox"',
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    const messageIds: string[] = listResponse.data.messages.map(
      (message: any) => message.id
    );
    const emailDetails = await fetchBatchEmailDetails(token, messageIds);
    const result = {
      emails: emailDetails,
      nextPageToken: listResponse.data.nextPageToken,
      resultSizeEstimate: listResponse.data.resultSizeEstimate,
      newAccessToken: accessToken,
    };

    res.status(200).json(result);
  }

  try {
    await getInboxEmails(accessToken!);
  } catch (error: any) {
    console.error("Gmail API error:", error);

    if (error.response && error.response.status === 401 && refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
        await getInboxEmails(accessToken);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        res
          .status(401)
          .json({ error: "Unauthorized: Token expired or invalid" });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
emailRouter.get("/sent", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];
  const pageToken = req.query.pageToken as string | undefined;

  async function getSentEmails(token: string) {
    const listResponse = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      {
        params: {
          maxResults: 24,
          pageToken: pageToken || undefined,
          q: 'in:"sent"',
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    const messageIds: string[] = listResponse.data.messages.map(
      (message: any) => message.id
    );
    const emailDetails = await fetchBatchEmailDetails(token, messageIds);
    const result = {
      emails: emailDetails,
      nextPageToken: listResponse.data.nextPageToken,
      resultSizeEstimate: listResponse.data.resultSizeEstimate,
      newAccessToken: accessToken,
    };

    res.status(200).json(result);
  }

  try {
    await getSentEmails(accessToken!);
  } catch (error: any) {
    console.error("Gmail API error:", error);

    if (error.response && error.response.status === 401 && refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
        await getSentEmails(accessToken);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        res
          .status(401)
          .json({ error: "Unauthorized: Token expired or invalid" });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

emailRouter.get("/email/:id", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];
  const emailId = req.params.id;

  async function getEmailDetails(token: string) {
    try {
      // Fetch the email message details
      const emailDetailsResponse = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const emailDetails = emailDetailsResponse.data;
      const threadId = emailDetails.threadId;

      // Fetch the entire thread
      const threadDetailsResponse = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const threadDetails = threadDetailsResponse.data;

      // Separate the main email from the thread messages
      const threadMessages = threadDetails.messages.filter(
        (message: any) => message.id !== emailId
      );

      res
        .status(200)
        .json({ emailDetails, threadMessages, newAccessToken: accessToken });
    } catch (error: any) {
      console.error("Gmail API error:", error);

      if (error.response && error.response.status === 401 && refreshToken) {
        try {
          accessToken = await refreshAccessToken(refreshToken);
          await getEmailDetails(accessToken);
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          res
            .status(401)
            .json({ error: "Unauthorized: Token expired or invalid" });
        }
      } else if (error.response && error.response.status === 404) {
        res.status(404).json({ error: "Email not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  try {
    await getEmailDetails(accessToken!);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

emailRouter.get("/email/:id/read", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];
  const emailId = req.params.id;

  async function markEmailAsRead(token: string) {
    try {
      const modifyResponse = await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
        {
          removeLabelIds: ["UNREAD"],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      res
        .status(200)
        .json({ message: "Email marked as read", newAccessToken: accessToken });
    } catch (error: any) {
      console.error("Gmail API error:", error);
      if (error.response && error.response.status === 401 && refreshToken) {
        try {
          accessToken = await refreshAccessToken(refreshToken);
          await markEmailAsRead(accessToken);
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          res
            .status(401)
            .json({ error: "Unauthorized: Token expired or invalid" });
        }
      } else if (error.response && error.response.status === 404) {
        res.status(404).json({ error: "Email not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  try {
    await markEmailAsRead(accessToken!);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const encodeMessage = (
  to: string,
  from: string,
  subject: string,
  htmlMessage: string,
  threadId?: string,
  messageId?: string
) => {
  const headers = [
    `Content-Type: text/html; charset=UTF-8`,
    `MIME-Version: 1.0`,
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
  ];

  if (threadId && messageId) {
    headers.push(`In-Reply-To: <${messageId}>`);
    headers.push(`References: <${messageId}>`);
  }

  const str = [
    ...headers,
    "",
    `${htmlMessage}`,
  ].join("\r\n");

  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};
emailRouter.post("/send/reply", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];
  const { to, from, subject, message, threadId, messageId } = req.body;  // Added threadId and messageId

  const sendEmail = async (token: string) => {
    const encodedMessage = encodeMessage(to, from, subject, message, threadId, messageId);  // Pass threadId and messageId

    try {
      const response = await axios.post(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          raw: encodedMessage,
          threadId: threadId,  // Include the threadId in the payload
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Gmail API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  try {
    await sendEmail(accessToken!);
  } catch (error: any) {
    console.error("Gmail API error:", error);
    if (error.response && error.response.status === 401 && refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
        await sendEmail(accessToken);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        res.status(401).json({ error: "Unauthorized: Token expired or invalid" });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
emailRouter.post("/send", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];
  const { to, from, subject, message } = req.body;

  const sendEmail = async (token: string) => {
    const encodedMessage = encodeMessage(to, from, subject, message);

    try {
      const response = await axios.post(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          raw: encodedMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Gmail API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  try {
    await sendEmail(accessToken!);
  } catch (error: any) {
    console.error("Gmail API error:", error);
    if (error.response && error.response.status === 401 && refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
        await sendEmail(accessToken);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        res
          .status(401)
          .json({ error: "Unauthorized: Token expired or invalid" });
      }
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default emailRouter;
