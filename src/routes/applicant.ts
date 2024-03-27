import express from "express";

export const applicantRouter = express.Router();

applicantRouter.post("/", async (req, res) => {
  console.log(req);

  res.json({ data: req.body });
});
