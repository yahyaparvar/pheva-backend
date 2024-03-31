import express from "express";
import multer from "multer";
import { ApplicantModel } from "../models/applicant";
import { uploadFile } from "../controllers/uploadFile";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const applicantRouter = express.Router();

applicantRouter.post("/", upload.single("cv"), async (req, res) => {
  const bodyData = req.body || {};
  let applicantData;
  try {
    let cvUrl = "";
    if (req.file) {
      const uploadedFile = await uploadFile(req.file);
      cvUrl = uploadedFile.data.attributes["cdn-url"];
    }
    applicantData = {
      ...bodyData,
      cv: cvUrl,
      skills: (bodyData.skills = JSON.parse(bodyData.skills)),
    };
    console.log(bodyData);

    const newApplicant = new ApplicantModel(applicantData);
    await newApplicant.save();
    res.json({ created: newApplicant });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
