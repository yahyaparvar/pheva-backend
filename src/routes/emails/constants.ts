import { Request } from "express";

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