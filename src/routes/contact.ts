import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { uploadFile } from "../controllers/uploadFile";
import { ContactModel } from "../models/contact";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const contactRouter = express.Router();
contactRouter.post("/", upload.single("attachment"), async (req, res) => {
  const bodyData = req.body || {};
  let contactData;
  try {
    if (req.file) {
      const uploadedFile = await uploadFile(req.file);
      contactData = {
        ...bodyData,
        attachment: uploadedFile.data.attributes["cdn-url"],
      };
    } else {
      contactData = { ...bodyData, attachment: null };
    }
    const newContact = new ContactModel(contactData);
    await newContact.save();
    res.json({ created: newContact });
  } catch (error) {
    res.json({ error: error });
  }
});
