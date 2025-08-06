const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());

// IMPORTANT: Add this line to parse JSON request bodies
app.use(express.json());

app.get('/alerts', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/alerts');
    if (Array.isArray(response.data)) {
      res.json(response.data);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts from AI Engine.' });
  }
});

app.post('/summarize', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8000/summarize', req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get summary from AI Engine' });
  }
});

app.post('/analyze-image', async (req, res) => {
  try {
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'File upload error' });
        return;
      }
      const file = files.image;
      const stream = fs.createReadStream(file.filepath);

      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', stream, file.originalFilename);

      const axiosConfig = { headers: formData.getHeaders() };
      const response = await axios.post('http://localhost:8000/analyze-image', formData, axiosConfig);

      res.json(response.data);
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

app.post('/predict', async (req, res) => {
  try {
    // Now req.body will be correctly parsed JSON
    const response = await axios.post('http://localhost:8000/predict', req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get prediction from AI Engine' });
  }
});

app.post('/parse-report', async (req, res) => {
  try {
    // req.body should be { report: string }
    const response = await axios.post('http://localhost:8000/parse-report', req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse operator report' });
  }
});

app.get('/logs', async (req, res) => {
  try {
    const resp = await axios.get('http://localhost:1337/api/maintenance-logs');
    const rawData = resp.data;

    if (!rawData || !Array.isArray(rawData.data)) {
      return res.status(500).json({ error: 'Invalid response from Strapi' });
    }

    // Direct mapping for flat-structure Strapi records
    const logs = rawData.data.map(item => ({
      id: item.id ?? null,
      date: item.date ?? 'N/A',
      zone: item.zone ?? 'N/A',
      description: item.description ?? 'N/A',
      engineer: item.engineer ?? 'N/A',
    }));

    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs from Strapi:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch logs from CMS' });
  }
});

app.post('/logs', async (req, res) => {
  try {
    const newLog = req.body;

    const resp = await axios.post('http://localhost:1337/api/maintenance-logs', {
      data: newLog, // Strapi expects { data: { ...fields } }
    });

    // Map response to flat log shape for the frontend (match GET /logs response)
    const entry = resp.data && resp.data.data;
    res.status(201).json(
      entry
        ? {
            id: entry.id,
            date: entry.attributes?.date ?? newLog.date ?? 'N/A',
            zone: entry.attributes?.zone ?? newLog.zone ?? 'N/A',
            description: entry.attributes?.description ?? newLog.description ?? 'N/A',
            engineer: entry.attributes?.engineer ?? newLog.engineer ?? 'N/A',
          }
        : {}
    );
  } catch (error) {
    console.error('Error creating a new log in Strapi:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create maintenance log' });
  }
});


app.put('/logs/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await axios.put(`http://localhost:1337/api/maintenance-logs/${id}`, {
      data: req.body, // already flat, wrap in { data: ... }
    });
    const entry = resp.data && resp.data.data;
    res.json(
      entry
        ? {
            id: entry.id,
            date: entry.attributes?.date ?? req.body.date ?? 'N/A',
            zone: entry.attributes?.zone ?? req.body.zone ?? 'N/A',
            description: entry.attributes?.description ?? req.body.description ?? 'N/A',
            engineer: entry.attributes?.engineer ?? req.body.engineer ?? 'N/A',
          }
        : {}
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to update maintenance log' });
  }
});


app.delete('/logs/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await axios.delete(`http://localhost:1337/api/maintenance-logs/${id}`);
    res.json({ message: `Log ${id} deleted`, status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete maintenance log' });
  }
});



const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
