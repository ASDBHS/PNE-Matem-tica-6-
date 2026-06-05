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

// ─────────────────────────────────────────────
// FUNCIÓN AUXILIAR 1: Mezclar opciones aleatoriamente
// ─────────────────────────────────────────────
function mezclar(opciones, claveOriginal) {
  const letras = ['A', 'B', 'C', 'D'];
  const pares = letras.map(l => ({ letra: l, texto: opciones[l] }));

  // Fisher-Yates shuffle
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
    if (par.texto === textoCorrectoOriginal) {
      nuevaClave = letraAsignada;
    }
  });

  return { opciones: nuevasOpciones, clave: nuevaClave };
}

// ─────────────────────────────────────────────
// FUNCIÓN AUXILIAR 2: Wrapper de llamada a Groq
// ─────────────────────────────────────────────
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

RESPONDE ÚNICAMENTE CON EL SIGUIENTE OBJETO JSON SIN TEXTO ADICIONAL:
{
  "contexto_situacional": "Texto de contexto o lectura corta que sitúa al estudiante (máx. 120 palabras)",
  "enunciado": "Pregunta clara y directa basada en el contexto",
  "opciones": {
    "A": "Primera opción de respuesta",
    "B": "Segunda opción de respuesta",
    "C": "Tercera opción de respuesta",
    "D": "Cuarta opción de respuesta"
  },
  "clave": "A",
  "pista": "Ayuda pedagógica que orienta al estudiante sin revelar la respuesta",
  "pasos_resolucion": [
    {"titulo": "Paso 1: Nombre del paso", "explicacion": "Explicación detallada del paso"}
  ]
}`;

  const promptUsuario = `Materia: ${materia}
Bloque Temático: ${bloque}
Afirmación de Aprendizaje a evaluar: "${afirmacion}"

Genera un ítem de selección única completo siguiendo exactamente el formato JSON solicitado.`;

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

// ─────────────────────────────────────────────
// FUNCIÓN PURA: Generador de ejercicios matemáticos
// CRÍTICO: No usa IA para calcular — JavaScript puro
// ─────────────────────────────────────────────
function crearEjercicioMat(bloque, afirmacion) {
  const contextosCR = [
    { lugar: 'la Feria del Agricultor de Cartago', moneda: 'colones', producto: 'tomates', vendedor: 'doña Carmen' },
    { lugar: 'la pulpería de San José', moneda: 'colones', producto: 'refrescos', vendedor: 'don Marcos' },
    { lugar: 'el mercado de Liberia', moneda: 'colones', producto: 'mangos', vendedor: 'doña Rosa' },
    { lugar: 'la feria de Alajuela', moneda: 'colones', producto: 'chayotes', vendedor: 'don Alberto' },
    { lugar: 'el supermercado de Heredia', moneda: 'colones', producto: 'plátanos', vendedor: 'la cajera' }
  ];
  const ctx = contextosCR[Math.floor(Math.random() * contextosCR.length)];

  let enunciado, respuestaCorrecta, opciones, clave, contextoSit, pasosResolucion;

  if (bloque === 'Números' || bloque === 'Operaciones') {
    const operacion = Math.random() > 0.5 ? 'suma' : 'resta';

    if (operacion === 'suma') {
      const a = Math.floor(Math.random() * 800) + 100;
      const b = Math.floor(Math.random() * 800) + 100;
      respuestaCorrecta = a + b;
      contextoSit = `En ${ctx.lugar}, ${ctx.vendedor} vendió ${ctx.producto}. 
El lunes vendió ₡${a.toLocaleString('es-CR')} y el martes vendió ₡${b.toLocaleString('es-CR')}.`;
      enunciado = `¿Cuántos colones recibió ${ctx.vendedor} en total durante los dos días?`;
      pasosResolucion = [
        { titulo: 'Paso 1: Identificar los datos', explicacion: `Día lunes: ₡${a.toLocaleString('es-CR')}. Día martes: ₡${b.toLocaleString('es-CR')}.` },
        { titulo: 'Paso 2: Elegir la operación', explicacion: 'Como queremos saber el TOTAL de ambos días, usamos una SUMA.' },
        { titulo: 'Paso 3: Calcular', explicacion: `₡${a.toLocaleString('es-CR')} + ₡${b.toLocaleString('es-CR')} = ₡${respuestaCorrecta.toLocaleString('es-CR')}` },
        { titulo: 'Paso 4: Verificar', explicacion: `La respuesta es ₡${respuestaCorrecta.toLocaleString('es-CR')}. Puedes verificar restando: ₡${respuestaCorrecta.toLocaleString('es-CR')} - ₡${b.toLocaleString('es-CR')} = ₡${a.toLocaleString('es-CR')} ✓` }
      ];
    } else {
      const total = Math.floor(Math.random() * 1500) + 1000;
      const gasto = Math.floor(Math.random() * (total - 200)) + 100;
      respuestaCorrecta = total - gasto;
      contextoSit = `En ${ctx.lugar}, ${ctx.vendedor} tenía ₡${total.toLocaleString('es-CR')} para comprar ${ctx.producto}. 
Gastó ₡${gasto.toLocaleString('es-CR')} en la compra.`;
      enunciado = `¿Cuántos colones le quedan a ${ctx.vendedor} después de la compra?`;
      pasosResolucion = [
        { titulo: 'Paso 1: Identificar los datos', explicacion: `Total disponible: ₡${total.toLocaleString('es-CR')}. Gasto realizado: ₡${gasto.toLocaleString('es-CR')}.` },
        { titulo: 'Paso 2: Elegir la operación', explicacion: 'Como queremos saber lo que QUEDA, usamos una RESTA.' },
        { titulo: 'Paso 3: Calcular', explicacion: `₡${total.toLocaleString('es-CR')} - ₡${gasto.toLocaleString('es-CR')} = ₡${respuestaCorrecta.toLocaleString('es-CR')}` },
        { titulo: 'Paso 4: Verificar', explicacion: `La respuesta es ₡${respuestaCorrecta.toLocaleString('es-CR')}. Verificamos: ₡${gasto.toLocaleString('es-CR')} + ₡${respuestaCorrecta.toLocaleString('es-CR')} = ₡${total.toLocaleString('es-CR')} ✓` }
      ];
    }
  } else if (bloque === 'Geometría') {
    const base = Math.floor(Math.random() * 8) + 3;
    const altura = Math.floor(Math.random() * 8) + 3;
    respuestaCorrecta = base * altura;
    contextoSit = `En la Escuela de ${ctx.lugar.split(' ').pop()}, el maestro de arte tiene un rectángulo de cartulina. 
El rectángulo mide ${base} cm de base y ${altura} cm de altura.`;
    enunciado = '¿Cuál es el área de la cartulina rectangularar?';
    pasosResolucion = [
      { titulo: 'Paso 1: Recordar la fórmula', explicacion: 'El área de un rectángulo se calcula con: Área = base × altura' },
      { titulo: 'Paso 2: Identificar los datos', explicacion: `Base = ${base} cm. Altura = ${altura} cm.` },
      { titulo: 'Paso 3: Sustituir y calcular', explicacion: `Área = ${base} cm × ${altura} cm = ${respuestaCorrecta} cm²` },
      { titulo: 'Paso 4: Escribir la unidad', explicacion: `La respuesta es ${respuestaCorrecta} cm² (centímetros cuadrados, porque es una medida de superficie).` }
    ];
    enunciado = `¿Cuál es el área de esa cartulina rectangular? (Área = base × altura)`;
  } else {
    // Fracciones / Medidas
    const partes = [2, 4, 5, 8, 10][Math.floor(Math.random() * 5)];
    const tomadas = Math.floor(Math.random() * (partes - 1)) + 1;
    const restantes = partes - tomadas;
    respuestaCorrecta = restantes;
    contextoSit = `En el recreo de la escuela, doña Luisa trajo una pizza y la dividió en ${partes} partes iguales para sus estudiantes. 
Los estudiantes ya se comieron ${tomadas} partes.`;
    enunciado = `¿Cuántas partes de pizza quedan?`;
    pasosResolucion = [
      { titulo: 'Paso 1: Datos del problema', explicacion: `Total de partes: ${partes}. Partes comidas: ${tomadas}.` },
      { titulo: 'Paso 2: Operación', explicacion: `Partes restantes = Total - Comidas = ${partes} - ${tomadas} = ${restantes}` },
      { titulo: 'Paso 3: Respuesta', explicacion: `Quedan ${restantes} partes de pizza.` }
    ];
  }

  // Generar distractores realistas
  const distractores = new Set();
  distractores.add(respuestaCorrecta);
  while (distractores.size < 4) {
    const variacion = Math.floor(Math.random() * 200) - 100;
    const distractor = respuestaCorrecta + variacion;
    if (distractor > 0 && distractor !== respuestaCorrecta) {
      distractores.add(distractor);
    }
  }

  const arrayDistr = [...distractores];
  // Shuffle distractores
  for (let i = arrayDistr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayDistr[i], arrayDistr[j]] = [arrayDistr[j], arrayDistr[i]];
  }

  const letras = ['A', 'B', 'C', 'D'];
  const opcionesObj = {};
  let claveAsignada = '';
  arrayDistr.forEach((val, idx) => {
    const letra = letras[idx];
    if (bloque === 'Geometría') {
      opcionesObj[letra] = `${val} cm²`;
    } else {
      opcionesObj[letra] = typeof val === 'number' && val > 99
        ? `₡${val.toLocaleString('es-CR')}`
        : `${val}`;
    }
    if (val === respuestaCorrecta) claveAsignada = letra;
  });

  return {
    contexto_situacional: contextoSit,
    enunciado,
    opciones: opcionesObj,
    clave: claveAsignada,
    pista: `Piensa: ¿qué operación necesitas para resolver este problema? Lee de nuevo el contexto e identifica los datos importantes.`,
    pasos_resolucion: pasosResolucion
  };
}

// ─────────────────────────────────────────────
// RUTA: /api/practica/matematicas
// ─────────────────────────────────────────────
app.post('/api/practica/matematicas', (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) {
      return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });
    }
    const ejercicio = crearEjercicioMat(bloque, afirmacion);
    res.json(ejercicio);
  } catch (err) {
    console.error('Error en /api/practica/matematicas:', err);
    res.status(500).json({ error: 'Error interno al generar ejercicio de matemáticas.' });
  }
});

// ─────────────────────────────────────────────
// RUTA: /api/practica/ciencias
// ─────────────────────────────────────────────
app.post('/api/practica/ciencias', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });

    const reglasExtra = `REGLAS ESPECÍFICAS PARA CIENCIAS (DGEC 2026):
- El contexto_situacional DEBE describir un ecosistema, especie, fenómeno natural o situación ambiental de Costa Rica.
- Usa flora y fauna nativas: quetzal, perezoso, tapir, bromelia, guanacaste, ceibo, etc.
- Menciona reservas, parques nacionales o regiones costarricenses cuando sea relevante.
- El ítem debe fomentar el pensamiento científico y la conciencia ambiental.
- Conecta con la vida cotidiana del estudiante costarricense.`;

    const data = await generarConIA('Ciencias', bloque, afirmacion, reglasExtra);
    const mezclado = mezclar(data.opciones, data.clave);
    res.json({ ...data, opciones: mezclado.opciones, clave: mezclado.clave });
  } catch (err) {
    console.error('Error en /api/practica/ciencias:', err);
    res.status(500).json({ error: 'Error al generar ítem de Ciencias.' });
  }
});

// ─────────────────────────────────────────────
// RUTA: /api/practica/espanol
// ─────────────────────────────────────────────
app.post('/api/practica/espanol', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });

    const reglasExtra = `REGLAS ESPECÍFICAS PARA ESPAÑOL (DGEC 2026):
- El campo "contexto_situacional" DEBE ser obligatoriamente un texto corto de comprensión lectora (mínimo 80 palabras, máximo 120 palabras).
- El texto debe ser una narración, descripción o diálogo apropiado para primaria costarricense.
- El enunciado DEBE referirse DIRECTAMENTE al texto (ej: "Según el texto...", "¿Qué significa en el texto...?").
- Evalúa comprensión lectora: idea principal, vocabulario en contexto, inferencias, estructura textual o propósito comunicativo.
- El texto puede incluir personajes, lugares o tradiciones de Costa Rica.
- NO hagas preguntas de gramática aislada; siempre parte del texto de comprensión.`;

    const data = await generarConIA('Español', bloque, afirmacion, reglasExtra);
    const mezclado = mezclar(data.opciones, data.clave);
    res.json({ ...data, opciones: mezclado.opciones, clave: mezclado.clave });
  } catch (err) {
    console.error('Error en /api/practica/espanol:', err);
    res.status(500).json({ error: 'Error al generar ítem de Español.' });
  }
});

// ─────────────────────────────────────────────
// RUTA: /api/practica/sociales
// ─────────────────────────────────────────────
app.post('/api/practica/sociales', async (req, res) => {
  try {
    const { bloque, afirmacion } = req.body;
    if (!bloque || !afirmacion) return res.status(400).json({ error: 'Se requieren bloque y afirmacion.' });

    const reglasExtra = `REGLAS ESPECÍFICAS PARA ESTUDIOS SOCIALES (DGEC 2026):
- El contexto_situacional DEBE referenciar historia, geografía, cultura o ciudadanía de Costa Rica.
- Puedes usar eventos históricos reales: Campaña Nacional 1856, abolición del ejército 1948, independencia 1821, etc.
- Menciona provincias, cantones, ríos, cordilleras, valles o regiones costarricenses cuando corresponda.
- Promueve valores democráticos, derechos humanos y ciudadanía activa en el contexto costarricense.
- Referencia figuras históricas costarricenses relevantes: Juan Santamaría, Braulio Carrillo, Carmen Lyra, etc.
- El ítem debe fomentar identidad nacional y pensamiento crítico ciudadano.`;

    const data = await generarConIA('Estudios Sociales', bloque, afirmacion, reglasExtra);
    const mezclado = mezclar(data.opciones, data.clave);
    res.json({ ...data, opciones: mezclado.opciones, clave: mezclado.clave });
  } catch (err) {
    console.error('Error en /api/practica/sociales:', err);
    res.status(500).json({ error: 'Error al generar ítem de Estudios Sociales.' });
  }
});

// ─────────────────────────────────────────────
// Iniciar servidor
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ TutoríaPRO corriendo en http://localhost:${PORT}`);
});
