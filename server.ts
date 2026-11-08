import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processGeminiQuery } from './server/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API config endpoint
app.get('/api/config', (_req, res) => {
  res.json({
    mapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini AI endpoint
app.post('/api/gemini/query', async (req, res) => {
  try {
    const { type, property, userPrompt } = req.body;
    if (!property) {
      return res.status(400).json({ success: false, error: 'Property data is required' });
    }
    const result = await processGeminiQuery(type || 'deep_analysis', property, userPrompt);
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Gemini query error:', message);
    res.status(500).json({ success: false, error: message });
  }
});

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
