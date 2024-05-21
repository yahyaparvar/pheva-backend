import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth/auth";
import { emailRouter } from "./routes/emails";

dotenv.config();

const app = express();
app.use(express.json());

const corsOpts = {
  origin: "*",//TODO:CHANGE
  methods: ["GET", "POST"],
};

app.use(cors(corsOpts));
app.use("/auth", authRouter);
app.use("/ai", aiRouter);
app.use("/emails", emailRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});