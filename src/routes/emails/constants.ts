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
