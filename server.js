const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Mezcla aleatoria de opciones para que la clave no sea siempre A
function mezclarOpciones(opciones, claveOriginal) {
  const letras = ['A', 'B', 'C', 'D'];
  const textos = letras.map(l => opciones[l]);

  // Fisher-Yates shuffle
  for (let i = textos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [textos[i], textos[j]] = [textos[j], textos[i]];
  }

  const textoClaveOriginal = opciones[claveOriginal];
  const nuevasOpciones = {};
  let nuevaClave = '';

  letras.forEach((l, i) => {
    nuevasOpciones[l] = textos[i];
    if (textos[i] === textoClaveOriginal) nuevaClave = l;
  });

  return { opciones: nuevasOpciones, clave: nuevaClave };
}

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
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Eres un generador experto de ítems de evaluación para la Prueba Nacional Estandarizada Diagnóstica de Matemáticas 2026 de Costa Rica, 6° grado primaria.

NIVEL DE DIFICULTAD: Intermedio-avanzado. Los problemas deben requerir análisis, razonamiento y varios pasos. No problemas de cálculo directo.

TIPOS DE PROBLEMAS que debes generar (variá entre estos):
- Problemas de dos o tres pasos donde el estudiante debe decidir qué operación usar
- Situaciones donde hay información extra que el estudiante debe ignorar
- Problemas inversos (dado el resultado, encontrar el dato)
- Interpretación de tablas, gráficos o patrones con preguntas de análisis
- Situaciones cotidianas de Costa Rica (colones, frutas locales, lugares del país)

DISTRACTORES: Los tres errores deben ser plausibles y representar errores de razonamiento reales (no números absurdos).

Responde SIEMPRE con un objeto JSON válido con exactamente estas claves:
- contexto_situacional: string (situación narrativa real, 2-3 oraciones)
- enunciado: string (pregunta clara que requiere análisis)
- opciones: objeto con claves A, B, C, D (cada una string con el valor y unidad si aplica)
- clave: string ("A", "B", "C" o "D") — ponela en posición ALEATORIA, no siempre A
- pista: string (pregunta orientadora que ayuda a identificar el camino de solución)
- pasos_resolucion: array de exactamente 4 objetos con "titulo" y "explicacion" detallada con números concretos`
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    const datos = await respuesta.json();
    if (datos.error) return res.status(500).json({ error: datos.error.message });

    const texto = datos.choices?.[0]?.message?.content || '';
    if (!texto) return res.status(500).json({ error: 'Respuesta vacía' });

    const ini = texto.indexOf('{');
    const fin = texto.lastIndexOf('}');
    if (ini === -1 || fin === -1) return res.status(500).json({ error: 'Sin JSON' });

    const ejercicio = JSON.parse(texto.substring(ini, fin + 1));

    if (!ejercicio.enunciado || !ejercicio.opciones || !ejercicio.clave) {
      return res.status(500).json({ error: 'JSON incompleto' });
    }

    // Mezclar opciones aleatoriamente en el servidor
    const { opciones, clave } = mezclarOpciones(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = opciones;
    ejercicio.clave    = clave;

    res.json(ejercicio);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`✅ Puerto ${PORT}`));
