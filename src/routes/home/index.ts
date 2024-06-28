import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import { refreshAccessToken } from "../auth/auth";

export const homeRouter = express.Router();

function getLastWeekDate(): string {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 1);
  return lastWeek.toISOString().split("T")[0];
}

async function getUnreadEmailCount(
  token: string,
  pageToken?: string
): Promise<number> {
  const lastWeekDate = getLastWeekDate();
  const listResponse = await axios.get(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    {
      params: {
        maxResults: 100, // Fetch up to 100 messages per request
        pageToken: pageToken || undefined,
        q: `in:inbox is:unread after:${lastWeekDate}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  let unreadCount = listResponse.data.messages?.length || 0;

  // If there's a nextPageToken, recursively fetch more emails and accumulate the count
  if (listResponse.data.nextPageToken) {
    unreadCount += await getUnreadEmailCount(
      token,
      listResponse.data.nextPageToken
    );
  }

  return unreadCount;
}

homeRouter.get("/unread-emails", async (req: Request, res: Response) => {
  let accessToken = (req as any).headers.authorization?.split(" ")[1];
  const refreshToken = (req as any).headers["x-refresh-token"];

  try {
    const unreadCount = await getUnreadEmailCount(accessToken!);
    res.status(200).json({ unreadCount });
  } catch (error: any) {
    console.error("Gmail API error:", error);

    if (error.response && error.response.status === 401 && refreshToken) {
      try {
        accessToken = await refreshAccessToken(refreshToken);
        const unreadCount = await getUnreadEmailCount(accessToken);
        res.status(200).json({ unreadCount });
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

const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

homeRouter.post(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    let accessToken = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.headers["x-refresh-token"] as string | undefined;

    if (!accessToken) {
      return res.status(400).json({ error: "Authorization token is required" });
    }

    function getTodayDateRange(): { timeMin: string; timeMax: string } {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeMin = today.toISOString();
      today.setHours(23, 59, 59, 999);
      const timeMax = today.toISOString();
      return { timeMin, timeMax };
    }

    async function getCalendarEvents(token: string) {
      const { timeMin, timeMax } = getTodayDateRange();
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          params: {
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: "startTime",
          },
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
