import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export const calendarRouter = express.Router();

// Type for Google Calendar Event

// Middleware for error handling
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

calendarRouter.post(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "Authorization token is required" });
    }
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.status(200).json(response.data.items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events", details: error });
    }
  })
);