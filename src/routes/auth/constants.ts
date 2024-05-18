import { Request } from "express";

export interface AuthRequest extends Request {
  body: {
    code: string;
  };
}
