import axios, { AxiosResponse } from "axios";
import express, { Request, Response } from "express";
import { parseMultipartResponse } from "../../utils";
import { Email, EmailRequest, EmailResponse } from "./constants";

export const emailRouter = express.Router();
emailRouter.use("/inbox", async (req: Request, res: Response) => {
  const accessToken = (req as EmailRequest).headers.authorization?.split(
    " "
  )[1];
  const pageToken = req.query.pageToken as string | undefined;

  try {
    const listResponse = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      {
        params: {
          maxResults: 50,
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
  } catch (error) {
    console.error("Gmail API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch email details in batch from Gmail API
const fetchBatchEmailDetails = async (
  accessToken: string,
  emailIds: string[]
): Promise<Email[]> => {
  const boundary = "batch_boundary";

  const body =
    emailIds
      .map((id) => {
        return [
          `--${boundary}`,
          "Content-Type: application/http",
          "",
          `GET /gmail/v1/users/me/messages/${id}?fields=id,labelIds,snippet,payload(headers)`,
          "",
        ].join("\r\n");
      })
      .join("\r\n") + `\r\n--${boundary}--`;

  const response: AxiosResponse<any> = await axios.post(
    "https://www.googleapis.com/batch/gmail/v1",
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
      },
    }
  );

  // Log the raw response for debugging
  const rawResponse = response.data;
  console.log("Raw batch response:", rawResponse);

  // Parse the raw response and extract email details
  const emailDetails = parseMultipartResponse(rawResponse)
    .map((message: any) => {
      if (!message.payload || !message.payload.headers) {
        console.error("Missing payload or headers in message:", message);
        return null;
      }

      const headers = message.payload.headers;
      const subjectHeader = headers.find((h: any) => h.name === "Subject");
      const dateHeader = headers.find((h: any) => h.name === "Date");
      const sender =
        headers
          .find((h: any) => h.name === "From")
          ?.value.replace(/<.*>/, "")
          .replace(/"/g, "")
          .trim() || "Unknown Sender";
      return {
        id: message.id,
        sender,
        snippet: message.snippet,
        subject: subjectHeader ? subjectHeader.value : "",
        date: dateHeader ? dateHeader.value : "",
        labels: message.labelIds,
      } as Email;
    })
    .filter((email): email is Email => email !== null);

  return emailDetails;
};
