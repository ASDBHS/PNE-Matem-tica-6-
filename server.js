// ══════════════════════════════════════════════════════════
//  SERVIDOR PROXY — MatemáticasPRO · SDBHS
//  Node.js + Express · Groq API (gratuita)
// ══════════════════════════════════════════════════════════

const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── Ruta principal: proxy hacia Groq ──────────────────────
app.post('/api/generar', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el campo prompt' });
  }

  try {
    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        max_tokens:  2048,
        temperature: 0.7,
        messages: [
          {
            role:    'system',
            content: 'Eres un generador de ítems de evaluación para la Prueba Nacional Estandarizada de Matemáticas de Costa Rica. Respondes ÚNICAMENTE con JSON válido, sin backticks ni texto adicional. Nunca truncues el JSON — siempre cierra todos los corchetes y llaves.'
          },
          {
            role:    'user',
            content: prompt
          }
        ]
      })
    });

    const datos = await respuesta.json();

    if (datos.error) {
      return res.status(500).json({ error: datos.error.message });
    }

    const texto = datos.choices?.[0]?.message?.content || '';

    if (!texto) {
      return res.status(500).json({ error: 'Respuesta vacía de Groq' });
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
  res.json({ estado: 'ok', modelo: 'llama-3.3-70b-versatile', version: '1.1' });
});

// ── Arrancar servidor ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
