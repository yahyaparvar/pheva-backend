import express from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const authRouter = express.Router();
authRouter.post("/", upload.single("attachment"), async (req, res) => {});
