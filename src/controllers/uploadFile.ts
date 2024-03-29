import axios from "axios";
import FormData from "form-data";
export async function uploadFile(file: Express.Multer.File) {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);
  try {
    const response = await axios.post(
      "https://app.simplefileupload.com/api/v1/file",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Basic ${Buffer.from(
            `${process.env.CDN_TOKEN}:${process.env.CDN_SECRET}`
          ).toString("base64")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
