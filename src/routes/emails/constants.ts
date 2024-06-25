import axios, { AxiosResponse } from "axios";
import { Request } from "express";
import { parseMultipartResponse } from "../../utils";

export interface EmailRequest extends Request {
  headers: {
    authorization: string;
  };
}

export interface Email {
  id: string;
  sender: string;
  snippet: string;
  subject: string;
  date: string;
  labels: string[];
  threadLength: number;
}

export interface EmailResponse {
  emails: Email[];
  nextPageToken: string | undefined;
  resultSizeEstimate: number;
}

export const fetchBatchEmailDetails = async (
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
          `GET /gmail/v1/users/me/messages/${id}?fields=id,labelIds,snippet,payload(headers),threadId`,
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

  // Parse the raw response and extract email details
  const emailDetails = await Promise.all(
    parseMultipartResponse(rawResponse).map(async (message: any) => {
      if (!message.payload || !message.payload.headers) {
        console.error("Missing payload or headers in message:", message);
        return null;
      }

      const headers = message.payload.headers;
      const subjectHeader = headers.find((h: any) => h.name === "Subject");
      const dateHeader = headers.find((h: any) => h.name === "Date");
      const fromHeader = headers.find((h: any) => h.name === "From");

      if (!subjectHeader || !dateHeader || !fromHeader) {
        console.error("Missing essential headers in message:", message);
        return null;
      }

      const sender =
        fromHeader.value.replace(/<.*>/, "").replace(/"/g, "").trim() ||
        "Unknown Sender";
      const threadId = message.threadId;
      let threadLength = 0;

      if (threadId) {
        try {
          const threadResponse = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
              },
            }
          );
          threadLength = threadResponse.data.messages.length;
        } catch (threadError) {
          console.error(
            "Error fetching thread length for message:",
            message.id,
            threadError
          );
        }
      }

      return {
        id: message.id,
        sender,
        snippet: message.snippet,
        subject: subjectHeader ? subjectHeader.value : "",
        date: dateHeader ? dateHeader.value : "",
        labels: message.labelIds,
        threadLength: threadLength,
      } as Email;
    })
  );

  return emailDetails.filter((email): email is Email => email !== null);
};
