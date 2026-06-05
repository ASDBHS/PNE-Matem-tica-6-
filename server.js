import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
// Servir la carpeta 'public' estáticamente
app.use(express.static(path.join(__dirname, 'public')));

// --- FUNCIONES AUXILIARES ---
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mezclar(opciones, claveOriginal) {
  const letras = ['A', 'B', 'C', 'D'];
  const textos = letras.map(l => opciones[l]);
  for (let i = textos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [textos[i], textos[j]] = [textos[j], textos[i]];
  }
  const textoCorrecta = opciones[claveOriginal];
  const nuevas = {};
  let nuevaClave = '';
  letras.forEach((l, i) => {
    nuevas[l] = textos[i];
    if (textos[i] === textoCorrecta) nuevaClave = l;
  });
  return { opciones: nuevas, clave: nuevaClave };
}

// Lógica pura de Matemáticas (Plantillas para evitar errores de IA)
function crearEjercicioMat() {
  const a = rand(10, 99);
  const b = rand(10, 99);
  const correcta = a + b;
  return {
    ctx: `En la feria del agricultor, un tramo vendió ${a} kilos de papas en la mañana y ${b} kilos en la tarde.`,
    enunciado: `¿Cuántos kilos de papas se vendieron en total durante el día?`,
    correcta: correcta.toString(),
    d: [(correcta + 10).toString(), (correcta - 10).toString(), (correcta + rand(1, 5)).toString()],
    pista: "Recordá que 'en total' significa que debés sumar ambas cantidades.",
    pasos: [
      { titulo: "Paso 1", explicacion: "Identificá los datos: Venta de la mañana = " + a + " kg, Venta de la tarde = " + b + " kg." },
      { titulo: "Paso 2", explicacion: `Sumá ambos valores: ${a} + ${b} = ${correcta}.` }
    ]
  };
}

// Función genérica para llamar a Groq según la materia
async function generarConIA(materia, bloque, afirmacion, reglasExtra) {
  const prompt = `
    Sos un experto creador de ítems de evaluación sumativa del MEP (Costa Rica) basado en el Marco DGEC 2026 para la materia de ${materia}.
    Bloque temático: "${bloque}"
    Afirmación a evaluar: "${afirmacion}"
    
    Reglas metodológicas:
    1. Usa un contexto costarricense (local/nacional) apropiado para primaria.
    2. Redacta 1 respuesta correcta y 3 distractores lógicos basados en errores comunes.
    ${reglasExtra}
    
    Devuelve ESTRICTAMENTE un JSON con esta estructura exacta, sin texto adicional:
    {
      "contexto_situacional": "Texto introductorio...",
      "enunciado": "La pregunta directa...",
      "opciones": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "clave": "A",
      "pista": "Una pista breve...",
      "pasos_resolucion": [{"titulo": "Paso 1", "explicacion": "..."}]
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content);
}

// --- RUTAS DE LA API POR MATERIA ---

app.post('/api/practica/matematicas', async (req, res) => {
  try {
    const ejBase = crearEjercicioMat();
    // Aquí puedes agregar un llamado a IA para reescribir el contexto si lo deseas, 
    // pero usamos la plantilla base para asegurar la matemática.
    const { opciones, clave } = mezclar({ A: ejBase.correcta, B: ejBase.d[0], C: ejBase.d[1], D: ejBase.d[2] }, 'A');
    res.json({ contexto_situacional: ejBase.ctx, enunciado: ejBase.enunciado, opciones, clave, pista: ejBase.pista, pasos_resolucion: ejBase.pasos });
  } catch (e) {
    res.status(500).json({ error: "Error en matemáticas" });
  }
});

app.post('/api/practica/ciencias', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    const reglas = "En Ciencias, enfócate en fenómenos naturales, flora, fauna, ecosistemas o salud, vinculados a Costa Rica.";
    const ej = await generarConIA("Ciencias", bloque, afirmacion, reglas);
    const mezclado = mezclar(ej.opciones, ej.clave);
    ej.opciones = mezclado.opciones; ej.clave = mezclado.clave;
    res.json(ej);
  } catch (e) { res.status(500).json({ error: "Error en ciencias" }); }
});

app.post('/api/practica/espanol', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    const reglas = "En Español Comprensión Lectora, el contexto DEBE ser un texto (literario o no literario corto) que el estudiante deba leer para responder.";
    const ej = await generarConIA("Español", bloque, afirmacion, reglas);
    const mezclado = mezclar(ej.opciones, ej.clave);
    ej.opciones = mezclado.opciones; ej.clave = mezclado.clave;
    res.json(ej);
  } catch (e) { res.status(500).json({ error: "Error en español" }); }
});

app.post('/api/practica/sociales', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    const reglas = "En Estudios Sociales, utiliza escenarios históricos, cívicos o geográficos específicos de las provincias y la historia de Costa Rica.";
    const ej = await generarConIA("Estudios Sociales", bloque, afirmacion, reglas);
    const mezclado = mezclar(ej.opciones, ej.clave);
    ej.opciones = mezclado.opciones; ej.clave = mezclado.clave;
    res.json(ej);
  } catch (e) { res.status(500).json({ error: "Error en sociales" }); }
});

app.listen(port, () => {
  console.log(`TutoríaPRO corriendo en http://localhost:${port}`);
});
