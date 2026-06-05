import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ── AUXILIAR 1: Mezclar opciones ──
function mezclar(opciones, claveOriginal) {
  const letras = ['A', 'B', 'C', 'D'];
  const pares = letras.map(l => ({ letra: l, texto: opciones[l] }));
  for (let i = pares.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pares[i], pares[j]] = [pares[j], pares[i]];
  }
  const textoCorrectoOriginal = opciones[claveOriginal];
  const nuevasOpciones = {};
  let nuevaClave = '';
  pares.forEach((par, idx) => {
    const letraAsignada = letras[idx];
    nuevasOpciones[letraAsignada] = par.texto;
    if (par.texto === textoCorrectoOriginal) nuevaClave = letraAsignada;
  });
  return { opciones: nuevasOpciones, clave: nuevaClave };
}

// ── AUXILIAR 2: Llamada a Groq ──
async function generarConIA(materia, bloque, afirmacion, reglasExtra = '') {
  const promptSistema = `Eres un evaluador experto del Ministerio de Educación Pública de Costa Rica (MEP),
especializado en la Dirección de Gestión y Evaluación de la Calidad (DGEC) 2026.
Tu rol es generar ítems de selección única de alta calidad para estudiantes de primaria,
siguiendo estrictamente los Marcos de Especificaciones de la DGEC.

REGLAS OBLIGATORIAS:
1. El ítem debe evaluar exactamente la afirmación de aprendizaje indicada.
2. La dificultad debe ser apropiada para primaria costarricense (6 a 12 años).
3. Las opciones de distractor deben ser plausibles y pedagógicamente fundamentadas.
4. El lenguaje debe ser claro, sencillo y contextualizado en la realidad costarricense.
5. La "pista" debe ser una ayuda pedagógica genuina, no revelar directamente la respuesta.
6. Los "pasos_resolucion" deben ser didácticos y numerados lógicamente.
${reglasExtra}

RESPONDE ÚNICAMENTE CON EL SIGUIENTE OBJETO JSON, SIN TEXTO ADICIONAL, SIN MARKDOWN:
{
  "contexto_situacional": "Texto de contexto que sitúa al estudiante (máx. 120 palabras)",
  "enunciado": "Pregunta clara y directa basada en el contexto",
  "opciones": {
    "A": "Primera opción de respuesta",
    "B": "Segunda opción de respuesta",
    "C": "Tercera opción de respuesta",
    "D": "Cuarta opción de respuesta"
  },
  "clave": "A",
  "pista": "Ayuda pedagógica sin revelar la respuesta",
  "pasos_resolucion": [
    {"titulo": "Paso 1: Nombre", "explicacion": "Explicación del paso"}
  ]
}`;

  const promptUsuario = `Materia: ${materia}
Bloque Temático: ${bloque}
Afirmación de Aprendizaje: "${afirmacion}"
Genera el ítem JSON completo.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: promptSistema },
      { role: 'user', content: promptUsuario }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 1200
  });

  return JSON.parse(completion.choices[0].message.content);
}

// ── FUNCIÓN PURA: Ejercicios de Matemáticas (sin IA) ──
// BUG CORREGIDO: enunciado doble en Geometría eliminado; bloque names alineados con CFG del frontend
function crearEjercicioMat(bloque, afirmacion) {
  const contextosCR = [
    { lugar: 'la Feria del Agricultor de Cartago', producto: 'tomates', vendedor: 'doña Carmen' },
    { lugar: 'la pulpería de San José', producto: 'refrescos', vendedor: 'don Marcos' },
    { lugar: 'el mercado de Liberia', producto: 'mangos', vendedor: 'doña Rosa' },
    { lugar: 'la feria de Alajuela', producto: 'chayotes', vendedor: 'don Alberto' },
    { lugar: 'el supermercado de Heredia', producto: 'plátanos', vendedor: 'la cajera' }
  ];
  const ctx = contextosCR[Math.floor(Math.random() * contextosCR.length)];

  let enunciado, respuestaCorrecta, contextoSit, pasosResolucion;

  // BUG FIX: los bloques ahora usan los mismos nombres que el CFG del frontend
  if (bloque === 'Números' || bloque === 'Operaciones') {
    const esSuma = Math.random() > 0.5;
    if (esSuma) {
      const a = Math.floor(Math.random() * 800) + 100;
      const b = Math.floor(Math.random() * 800) + 100;
      respuestaCorrecta = a + b;
      contextoSit = `En ${ctx.lugar}, ${ctx.vendedor} vendió ${ctx.producto}. El lunes recibió ₡${a.toLocaleString('es-CR')} y el martes ₡${b.toLocaleString('es-CR')}.`;
      enunciado = `¿Cuántos colones recibió ${ctx.vendedor} en total durante los dos días?`;
      pasosResolucion = [
        { titulo: 'Paso 1: Identificar los datos', explicacion: `Lunes: ₡${a.toLocaleString('es-CR')}. Martes: ₡${b.toLocaleString('es-CR')}.` },
        { titulo: 'Paso 2: Elegir la operación', explicacion: 'Queremos el TOTAL → usamos SUMA.' },
        { titulo: 'Paso 3: Calcular', explicacion: `₡${a.toLocaleString('es-CR')} + ₡${b.toLocaleString('es-CR')} = ₡${respuestaCorrecta.toLocaleString('es-CR')}` },
        { titulo: 'Paso 4: Verificar', explicacion: `Comprobamos: ₡${respuestaCorrecta.toLocaleString('es-CR')} − ₡${b.toLocaleString('es-CR')} = ₡${a.toLocaleString('es-CR')} ✓` }
      ];
    } else {
      const total = Math.floor(Math.random() * 1500) + 1000;
      const gasto = Math.floor(Math.random() * (total - 200)) + 100;
      respuestaCorrecta = total - gasto;
      contextoSit = `En ${ctx.lugar}, ${ctx.vendedor} tenía ₡${total.toLocaleString('es-CR')} para comprar ${ctx.producto} y gastó ₡${gasto.toLocaleString('es-CR')}.`;
      enunciado = `¿Cuántos colones le quedan después de la compra?`;
      pasosResolucion = [
        { titulo: 'Paso 1: Identificar los datos', explicacion: `Total: ₡${total.toLocaleString('es-CR')}. Gasto: ₡${gasto.toLocaleString('es-CR')}.` },
        { titulo: 'Paso 2: Elegir la operación', explicacion: 'Queremos lo que QUEDA → usamos RESTA.' },
        { titulo: 'Paso 3: Calcular', explicacion: `₡${total.toLocaleString('es-CR')} − ₡${gasto.toLocaleString('es-CR')} = ₡${respuestaCorrecta.toLocaleString('es-CR')}` },
        { titulo: 'Paso 4: Verificar', explicacion: `Comprobamos: ₡${gasto.toLocaleString('es-CR')} + ₡${respuestaCorrecta.toLocaleString('es-CR')} = ₡${total.toLocaleString('es-CR')} ✓` }
      ];
    }
  } else if (bloque === 'Geometría') {
    const base = Math.floor(Math.random() * 8) + 3;
    const altura = Math.floor(Math.random() * 8) + 3;
    respuestaCorrecta = base * altura;
    contextoSit = `En la escuela, el maestro de arte tiene una cartulina rectangular de ${base} cm de base y ${altura} cm de altura.`;
    // BUG FIX: eliminada la doble asignación y el typo "rectangularar"
    enunciado = `¿Cuál es el área de esa cartulina? (Área = base × altura)`;
    pasosResolucion = [
      { titulo: 'Paso 1: Recordar la fórmula', explicacion: 'Área de rectángulo = base × altura' },
      { titulo: 'Paso 2: Identificar los datos', explicacion: `Base = ${base} cm. Altura = ${altura} cm.` },
      { titulo: 'Paso 3: Calcular', explicacion: `${base} × ${altura} = ${respuestaCorrecta} cm²` },
      { titulo: 'Paso 4: Unidad', explicacion: `La respuesta es ${respuestaCorrecta} cm² (centímetros cuadrados).` }
    ];
  } else {
    // Fracciones / Medidas
    const partes = [2, 4, 5, 8, 10][Math.floor(Math.random() * 5)];
    const tomadas = Math.floor(Math.random() * (partes - 1)) + 1;
    respuestaCorrecta = partes - tomadas;
    contextoSit = `En el recreo, doña Luisa trajo una pizza dividida en ${partes} partes iguales. Los estudiantes se comieron ${tomadas} partes.`;
    enunciado = `¿Cuántas partes de pizza quedan?`;
    pasosResolucion = [
      { titulo: 'Paso 1: Datos', explicacion: `Total: ${partes} partes. Comidas: ${tomadas}.` },
      { titulo: 'Paso 2: Operación', explicacion: `Restantes = ${partes} − ${tomadas} = ${respuestaCorrecta}` },
      { titulo: 'Paso 3: Respuesta', explicacion: `Quedan ${respuestaCorrecta} partes de pizza.` }
    ];
  }

  // Generar distractores
  const distractores = new Set([respuestaCorrecta]);
  let intentos = 0;
  while (distractores.size < 4 && intentos < 100) {
    intentos++;
    const delta = Math.floor(Math.random() * 150) + 1;
    const d = Math.random() > 0.5 ? respuestaCorrecta + delta : respuestaCorrecta - delta;
    if (d > 0) distractores.add(d);
  }

  const arr = [...distractores];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const letras = ['A', 'B', 'C', 'D'];
  const opcionesObj = {};
  let claveAsignada = '';
  arr.forEach((val, idx) => {
    const letra = letras[idx];
    opcionesObj[letra] = bloque === 'Geometría' ? `${val} cm²` : (val > 99 ? `₡${val.toLocaleString('es-CR')}` : `${val}`);
    if (val === respuestaCorrecta) claveAsignada = letra;
  });

  return {
    contexto_situacional: contextoSit,
    enunciado,
    opciones: opcionesObj,
    clave: claveAsignada,
    pista: '¿Qué operación necesitas? Lee el contexto e identifica los números importantes.',
    pasos_resolucion: pasosResolucion
  };
}

// ── RUTA: Matemáticas ──
app.post('/api/practica/matematicas', (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });
    const ejercicio = crearEjercicioMat(bloque, afirmacion);
    res.json(ejercicio);
  } catch (err) {
    console.error('Error /api/practica/matematicas:', err);
    res.status(500).json({ error: 'Error al generar ejercicio de matemáticas.' });
  }
});

// ── RUTA: Ciencias ──
app.post('/api/practica/ciencias', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });
    const reglasExtra = `REGLAS DGEC CIENCIAS:
- El contexto_situacional DEBE describir un ecosistema, especie o fenómeno natural de Costa Rica.
- Usa flora y fauna nativas: quetzal, perezoso, tapir, bromelia, guanacaste, etc.
- Menciona parques nacionales o regiones costarricenses cuando sea relevante.
- Fomenta pensamiento científico y conciencia ambiental.`;
    const data = await generarConIA('Ciencias', bloque, afirmacion, reglasExtra);
    const { opciones, clave } = mezclar(data.opciones, data.clave);
    res.json({ ...data, opciones, clave });
  } catch (err) {
    console.error('Error /api/practica/ciencias:', err);
    res.status(500).json({ error: 'Error al generar ítem de Ciencias.' });
  }
});

// ── RUTA: Español ──
app.post('/api/practica/espanol', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });
    const reglasExtra = `REGLAS DGEC ESPAÑOL:
- El campo "contexto_situacional" DEBE ser un texto corto de comprensión lectora (80-120 palabras).
- El enunciado DEBE referirse directamente al texto ("Según el texto...", "¿Qué significa...?").
- Evalúa: idea principal, vocabulario en contexto, inferencias o propósito comunicativo.
- El texto puede incluir personajes o tradiciones de Costa Rica.`;
    const data = await generarConIA('Español', bloque, afirmacion, reglasExtra);
    const { opciones, clave } = mezclar(data.opciones, data.clave);
    res.json({ ...data, opciones, clave });
  } catch (err) {
    console.error('Error /api/practica/espanol:', err);
    res.status(500).json({ error: 'Error al generar ítem de Español.' });
  }
});

// ── RUTA: Estudios Sociales ──
app.post('/api/practica/sociales', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });
    const reglasExtra = `REGLAS DGEC SOCIALES:
- El contexto DEBE referenciar historia, geografía, cultura o ciudadanía de Costa Rica.
- Usa eventos históricos reales: Campaña Nacional 1856, abolición del ejército 1948, independencia 1821.
- Menciona provincias, cantones, ríos o cordilleras costarricenses cuando corresponda.
- Promueve valores democráticos e identidad nacional.`;
    const data = await generarConIA('Estudios Sociales', bloque, afirmacion, reglasExtra);
    const { opciones, clave } = mezclar(data.opciones, data.clave);
    res.json({ ...data, opciones, clave });
  } catch (err) {
    console.error('Error /api/practica/sociales:', err);
    res.status(500).json({ error: 'Error al generar ítem de Estudios Sociales.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ TutoríaPRO corriendo en http://localhost:${PORT}`);
});
