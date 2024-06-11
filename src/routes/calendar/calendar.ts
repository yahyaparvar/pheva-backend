import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import { refreshAccessToken } from "../auth/auth";

export const calendarRouter = express.Router();

const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

calendarRouter.post(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    let accessToken = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.headers["x-refresh-token"] as string | undefined;

    if (!accessToken) {
      return res.status(400).json({ error: "Authorization token is required" });
    }

    async function getCalendarEvents(token: string) {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = {
        items: response.data.items,
        newAccessToken: token,
      };

      res.status(200).json(result);
    }

    try {
      await getCalendarEvents(accessToken);
    } catch (error: any) {
      console.error("Google Calendar API error:", error);

      if (error.response && error.response.status === 401 && refreshToken) {
        try {
          accessToken = await refreshAccessToken(refreshToken);
          await getCalendarEvents(accessToken);
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          res
            .status(401)
            .json({ error: "Unauthorized: Token expired or invalid" });
        }
      } else {
        res
          .status(500)
          .json({ error: "Failed to fetch events", details: error });
      }
    }
  })
);

export default calendarRouter;
