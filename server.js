const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.post('/api/generar', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Falta prompt' });

  try {
    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        max_tokens:  3000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role:    'system',
            content: `Eres un generador de ítems para la Prueba Nacional de Matemáticas de Costa Rica, 6° grado.
Responde SIEMPRE con un objeto JSON válido con exactamente estas claves:
- contexto_situacional: string (puede ser vacío)
- enunciado: string
- opciones: objeto con claves A, B, C, D (cada una string)
- clave: string (debe ser "A", "B", "C" o "D")
- pista: string
- pasos_resolucion: array de exactamente 4 objetos, cada uno con "titulo" y "explicacion" (ambos strings cortos)`
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    const datos = await respuesta.json();
    if (datos.error) return res.status(500).json({ error: datos.error.message });

    const texto = datos.choices?.[0]?.message?.content || '';
    if (!texto) return res.status(500).json({ error: 'Respuesta vacía' });

    // Parsear y re-serializar para garantizar JSON limpio
    const ini = texto.indexOf('{');
    const fin = texto.lastIndexOf('}');
    if (ini === -1 || fin === -1) return res.status(500).json({ error: 'Sin JSON' });

    const ejercicio = JSON.parse(texto.substring(ini, fin + 1));

    // Validar estructura mínima
    if (!ejercicio.enunciado || !ejercicio.opciones || !ejercicio.clave) {
      return res.status(500).json({ error: 'JSON incompleto' });
    }

    res.json(ejercicio);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`✅ Puerto ${PORT}`));
