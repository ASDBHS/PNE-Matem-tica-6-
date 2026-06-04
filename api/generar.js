// ══════════════════════════════════════════════════════════
//  API SERVERLESS — MatemáticasPRO · SDBHS
//  Vercel Serverless Function · Groq API (gratuita)
// ══════════════════════════════════════════════════════════

function mezclarOpciones(opciones, claveOriginal) {
  const letras = ['A', 'B', 'C', 'D'];
  const textos = letras.map(l => opciones[l]);
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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

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

TIPOS DE PROBLEMAS (variá entre estos):
- Problemas de dos o tres pasos donde el estudiante debe decidir qué operación usar
- Situaciones con información extra que el estudiante debe ignorar
- Problemas inversos: dado el resultado, encontrar el dato
- Interpretación de tablas o patrones con preguntas de análisis
- Situaciones cotidianas de Costa Rica (colones, frutas locales, lugares del país)

DISTRACTORES: Los tres errores deben representar errores de razonamiento reales, no valores absurdos.

Responde SIEMPRE con un objeto JSON válido con exactamente estas claves:
- contexto_situacional: string (situación narrativa real, 2-3 oraciones)
- enunciado: string (pregunta que requiere análisis)
- opciones: objeto con claves A, B, C, D
- clave: string ("A", "B", "C" o "D") en posición ALEATORIA
- pista: string (pregunta orientadora sin revelar la respuesta)
- pasos_resolucion: array de exactamente 4 objetos con "titulo" y "explicacion" detallada`
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

    const { opciones, clave } = mezclarOpciones(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = opciones;
    ejercicio.clave    = clave;

    return res.status(200).json(ejercicio);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
