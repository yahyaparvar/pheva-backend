import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import { applicantRouter } from "./routes/applicant";

dotenv.config();

const app: Express = express();
app.use(express.json({ limit: "30mb" }));
const corsOpts = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOpts));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use("/apply", applicantRouter);

const PORT: number = parseInt(process.env.PORT as string, 10) || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
