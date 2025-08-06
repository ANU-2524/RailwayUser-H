const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;


router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  try {
    const openrouterRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-r1:free',
      messages: [
        { role: 'system', content: 'You are a helpful railways assistant. Reply concisely and professionally.' },
        ...history,
        { role: 'user', content: message }
      ],
    }, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    res.json({ content: openrouterRes.data.choices[0].message.content });
  } catch (err) {
    console.error('Chat API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Chatbot error', details: err.message });
  }
});

module.exports = router;
