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
            `p123881157f0053d1990c36d89b1373bb:se275efd6802752e62f26daef4a96d332`
          ).toString("base64")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
