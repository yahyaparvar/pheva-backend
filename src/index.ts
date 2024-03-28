import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import { applicantRouter } from "./routes/applicant";
import { mongoose } from "@typegoose/typegoose";
import { contactRouter } from "./routes/contact";

dotenv.config();

const app: Express = express();
app.use(express.json({ limit: "30mb" }));
const corsOpts = {
  origin: "*",
  methods: ["GET", "POST"],
};
const MONGODB_URL =
  process.env.MONGODB_URL ||
  "mongodb+srv://yaya:DSoIRrjAbtv7f9bY@cluster0.1zjogmo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log(`Connected to MongoDB and here is the url: ${MONGODB_URL}`);
  })
  .catch((error: Error) => {
    console.log("Could not connect to database", "sek");
  });

app.use(cors(corsOpts));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use("/apply", applicantRouter);
app.use("/contact", contactRouter);

const PORT: number = parseInt(process.env.PORT as string, 10) || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
