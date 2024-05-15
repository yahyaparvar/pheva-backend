import express, { Request, Response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

interface GoogleAuthRequest extends Request {
  body: {
    code: string;
  };
}

app.post('/auth/google', async (req: GoogleAuthRequest, res: Response) => {
  const { code } = req.body;

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
        redirect_uri: 'YOUR_REDIRECT_URI',
        grant_type: 'authorization_code',
      },
    });

    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
