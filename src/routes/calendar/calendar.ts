import axios from "axios";
import express from "express";
export const calendarRouter = express.Router();

calendarRouter.post("/events", async (req, res) => {
  const { token } = req.body;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
        params: {
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: "startTime",
        },
      }
    );
    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ error: `Error fetching events: ${error}` });
  }
});
