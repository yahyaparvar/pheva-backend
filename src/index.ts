import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth/auth";
import { calendarRouter } from "./routes/calendar/calendar";
import { emailRouter } from "./routes/emails";
import { homeRouter } from "./routes/home";

dotenv.config();

const app = express();
app.use(express.json());

const corsOpts = {
  origin: "https://pheva.vercel.app", // Replace with your frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"], // Adjust headers as necessary
};

app.use(cors(corsOpts));
app.use("/", (req, res) => {
  res.send("Deployed successfully");
});
app.use("/home", homeRouter);
app.use("/auth", authRouter);
app.use("/ai", aiRouter);
app.use("/emails", emailRouter);
app.use("/calendar", calendarRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
