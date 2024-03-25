import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json({ limit: "30mb" }));
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],
};

app.use(cors(corsOpts));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

app.use("/", (req, res) => {
  res.send({ answer: "Workin' fine" });
});
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
