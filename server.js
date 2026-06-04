// ══════════════════════════════════════════════════════════
//  SERVIDOR PROXY — MatemáticasPRO · SDBHS
//  Node.js + Express · Google Gemini API (gratuita)
// ══════════════════════════════════════════════════════════
 
const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
 
const app  = express();
const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
 
// ── Ruta principal: proxy hacia Google Gemini ─────────────
app.post('/api/generar', async (req, res) => {
  const { prompt } = req.body;
 
  if (!prompt) {
    return res.status(400).json({ error: 'Falta el campo prompt' });
  }
 
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const URL     = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
 
    const respuesta = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 1200
        }
      })
    });
 
    const datos = await respuesta.json();
 
    if (datos.error) {
      return res.status(500).json({ error: datos.error.message });
    }
 
    // Extraer texto de la respuesta de Gemini
    const texto = datos.candidates?.[0]?.content?.parts?.[0]?.text || '';
 
    if (!texto) {
      return res.status(500).json({ error: 'Respuesta vacía de Gemini' });
    }
 
    // Extraer JSON robusto
    const ini = texto.indexOf('{');
    const fin = texto.lastIndexOf('}');
 
    if (ini === -1 || fin === -1) {
      return res.status(500).json({ error: 'Respuesta sin JSON válido' });
    }
 
    const ejercicio = JSON.parse(texto.substring(ini, fin + 1));
    res.json(ejercicio);
 
  } catch (err) {
    console.error('Error en proxy:', err);
    res.status(500).json({ error: err.message });
  }
});
 
// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ estado: 'ok', modelo: 'gemini-1.5-flash', version: '1.0' });
});
 
// ── Arrancar servidor ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
 
