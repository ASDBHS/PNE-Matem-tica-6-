// ══════════════════════════════════════════════════════════
//  SERVIDOR PROXY — MatemáticasPRO · SDBHS
//  Node.js + Express · Intermediario hacia Anthropic API
// ══════════════════════════════════════════════════════════

const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────────
app.use(cors());                         // Permite llamadas desde cualquier origen
app.use(express.json());                 // Parsea JSON en el body
app.use(express.static('public'));       // Sirve el HTML desde la carpeta /public

// ── Ruta principal: proxy hacia Anthropic ─────────────────
app.post('/api/generar', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el campo prompt' });
  }

  try {
    const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,   // La key vive SOLO aquí
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages:   [{ role: 'user', content: prompt }]
      })
    });

    const datos = await respuesta.json();

    if (datos.error) {
      return res.status(500).json({ error: datos.error.message });
    }

    // Extraer el texto de la respuesta
    const texto = datos.content.map(b => b.text || '').join('');
    const ini   = texto.indexOf('{');
    const fin   = texto.lastIndexOf('}');

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
  res.json({ estado: 'ok', version: '1.0' });
});

// ── Arrancar servidor ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
