// ══════════════════════════════════════════════════════════════
//  TutoríaPRO — Backend Unificado v2
//  SDBHS · DGEC 2026 · Node.js + Express + Groq SDK
//  Rutas:
//    POST /api/generar  →  primaria (mat/esp/cien/ss) y
//                          secundaria (sec-mat/sec-esp/sec-cien/sec-ss/sec-civ)
// ══════════════════════════════════════════════════════════════

import express         from 'express';
import cors            from 'cors';
import dotenv          from 'dotenv';
import Groq            from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ══════════════════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════════════════

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

async function generarConIA(promptCompleto) {
  const completion = await groq.chat.completions.create({
    model:           'llama-3.3-70b-versatile',
    max_tokens:      1800,
    temperature:     0.85,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: promptCompleto }]
  });
  const texto = completion.choices[0]?.message?.content || '';
  const ini   = texto.indexOf('{');
  const fin   = texto.lastIndexOf('}');
  if (ini === -1 || fin === -1) throw new Error('Respuesta sin JSON válido');
  return JSON.parse(texto.substring(ini, fin + 1));
}

const JSON_SCHEMA = `Respondé ÚNICAMENTE con este objeto JSON exacto, sin backticks, sin texto extra:
{
  "contexto_situacional": "...",
  "enunciado": "...",
  "opciones": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "clave": "B",
  "pista": "...",
  "pasos_resolucion": [
    { "titulo": "...", "explicacion": "..." },
    { "titulo": "...", "explicacion": "..." },
    { "titulo": "...", "explicacion": "..." },
    { "titulo": "...", "explicacion": "..." }
  ]
}`;

// ══════════════════════════════════════════════════════════════
//  GENERADOR MATEMÁTICAS PRIMARIA (plantillas exactas)
// ══════════════════════════════════════════════════════════════

function crearEjercicioMatPrimaria() {
  const r   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const tipo = r(0, 7);

  if (tipo === 0) {
    const total = r(200, 999), div = r(6, 20);
    const cociente = Math.floor(total / div), resto = total % div;
    return {
      ctx: `En la Feria del Agricultor de Alajuela, don Marco tiene ${total} naranjas que quiere empacar en bolsas de ${div} unidades cada una.`,
      enunciado: `¿Cuántas bolsas completas puede llenar don Marco?`,
      correcta: `${cociente} bolsas`,
      d: [`${cociente + 1} bolsas`, `${cociente - 1} bolsas`, `${Math.floor(total / (div + 3))} bolsas`],
      pista: `Pensá: ¿cuántas veces cabe ${div} dentro de ${total}? Usá la división y fijate solo en el resultado entero.`,
      pasos: [
        { titulo: 'Comprender',  explicacion: `Tenemos ${total} naranjas y bolsas de ${div}. Queremos cuántas bolsas completas obtenemos.` },
        { titulo: 'Plantear',    explicacion: `Dividimos el total entre el tamaño: ${total} ÷ ${div}` },
        { titulo: 'Resolver',    explicacion: `${total} ÷ ${div} = ${cociente} con resto ${resto}. Solo contamos las bolsas completas.` },
        { titulo: 'Verificar',   explicacion: `${cociente} × ${div} = ${cociente * div}. Más ${resto} sobrantes = ${total}. ✓` }
      ]
    };
  }

  if (tipo === 1) {
    const pct   = [10, 20, 25, 50][r(0, 3)];
    const total = pct === 25 ? r(4, 20) * 4 : pct === 50 ? r(4, 20) * 2 : r(5, 30) * 10;
    const res   = (total * pct) / 100;
    return {
      ctx: `En la soda escolar del SDBHS se vendieron ${total} refrescos durante la semana.`,
      enunciado: `Si el ${pct}% de los refrescos eran de cas, ¿cuántos refrescos de cas se vendieron?`,
      correcta: `${res} refrescos`,
      d: [`${res + pct} refrescos`, `${total - res} refrescos`, `${res + 10} refrescos`],
      pista: `Para calcular el ${pct}% de ${total}: multiplicá ${total} × ${pct} y dividí entre 100.`,
      pasos: [
        { titulo: 'Comprender',  explicacion: `Queremos el ${pct}% de ${total} refrescos.` },
        { titulo: 'Plantear',    explicacion: `${total} × ${pct} ÷ 100` },
        { titulo: 'Resolver',    explicacion: `${total} × ${pct} = ${total * pct}. Luego ÷ 100 = ${res}.` },
        { titulo: 'Verificar',   explicacion: `${res} es el ${pct}% de ${total}. ✓` }
      ]
    };
  }

  if (tipo === 2) {
    const horas = r(1, 8), mins = r(5, 55);
    const totalMin = horas * 60 + mins;
    return {
      ctx: `El viaje en autobús desde San José hasta Liberia dura ${horas} horas y ${mins} minutos.`,
      enunciado: `¿Cuántos minutos dura el viaje en total?`,
      correcta: `${totalMin} minutos`,
      d: [`${horas * 60} minutos`, `${totalMin + 10} minutos`, `${totalMin - 5} minutos`],
      pista: `1 hora = 60 minutos. Convertí las horas y sumá los minutos adicionales.`,
      pasos: [
        { titulo: 'Comprender',  explicacion: `Tenemos ${horas} horas y ${mins} minutos. Queremos el total en minutos.` },
        { titulo: 'Plantear',    explicacion: `${horas} × 60 + ${mins}` },
        { titulo: 'Resolver',    explicacion: `${horas} × 60 = ${horas * 60}. Más ${mins} = ${totalMin} min.` },
        { titulo: 'Verificar',   explicacion: `${horas * 60} + ${mins} = ${totalMin}. ✓` }
      ]
    };
  }

  if (tipo === 3) {
    const base = r(4, 25), altura = r(3, 15);
    const area = base * altura, perim = 2 * (base + altura);
    return {
      ctx: `Una familia de Cartago tiene un jardín rectangular de ${base} metros de largo y ${altura} metros de ancho.`,
      enunciado: `¿Cuál es el área del jardín?`,
      correcta: `${area} m²`,
      d: [`${perim} m²`, `${area + base} m²`, `${area - altura} m²`],
      pista: `Área de rectángulo = base × altura`,
      pasos: [
        { titulo: 'Comprender',  explicacion: `Jardín de ${base} m × ${altura} m. Queremos el área.` },
        { titulo: 'Plantear',    explicacion: `Área = ${base} × ${altura}` },
        { titulo: 'Resolver',    explicacion: `${base} × ${altura} = ${area} m²` },
        { titulo: 'Verificar',   explicacion: `${area} ÷ ${base} = ${altura}. ✓` }
      ]
    };
  }

  if (tipo === 4) {
    const inc = r(3, 15), ini = r(2, 20);
    const seq = [0, 1, 2, 3, 4].map(i => ini + inc * i);
    return {
      ctx: `La profesora Patricia propone a sus estudiantes encontrar el patrón de la siguiente sucesión numérica.`,
      enunciado: `¿Cuál es el número que sigue? ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ___`,
      correcta: `${seq[4]}`,
      d: [`${seq[4] + inc}`, `${seq[4] - 1}`, `${seq[3] + inc - 1}`],
      pista: `Calculá la diferencia entre números consecutivos. ¿Es siempre la misma?`,
      pasos: [
        { titulo: 'Comprender',        explicacion: `Sucesión: ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}.` },
        { titulo: 'Identificar patrón',explicacion: `Diferencia constante: ${inc}.` },
        { titulo: 'Resolver',          explicacion: `${seq[3]} + ${inc} = ${seq[4]}.` },
        { titulo: 'Verificar',         explicacion: `Sucesión completa: ${seq.join(', ')}. ✓` }
      ]
    };
  }

  if (tipo === 5) {
    const kg = r(2, 10), g = r(100, 900);
    const totalG = kg * 1000 + g;
    return {
      ctx: `En el supermercado La Colonia de Heredia, una bolsa de frijoles pesa ${kg} kg y ${g} g.`,
      enunciado: `¿Cuántos gramos pesa la bolsa en total?`,
      correcta: `${totalG} g`,
      d: [`${kg * 1000} g`, `${totalG + 100} g`, `${totalG - 50} g`],
      pista: `1 kg = 1000 g. Convertí y sumá.`,
      pasos: [
        { titulo: 'Comprender',  explicacion: `${kg} kg y ${g} g. Queremos el total en gramos.` },
        { titulo: 'Plantear',    explicacion: `${kg} × 1000 + ${g}` },
        { titulo: 'Resolver',    explicacion: `${kg * 1000} + ${g} = ${totalG} g.` },
        { titulo: 'Verificar',   explicacion: `${kg * 1000} + ${g} = ${totalG}. ✓` }
      ]
    };
  }

  if (tipo === 6) {
    const dens  = [2, 4, 5][r(0, 2)];
    const num   = r(1, dens - 1);
    const total = dens * r(4, 12);
    const parte = (total * num) / dens;
    return {
      ctx: `En el Festival de Frutas de Quepos, una canasta tiene ${total} frutas tropicales.`,
      enunciado: `Si ${num}/${dens} de las frutas son piñas, ¿cuántas piñas hay?`,
      correcta: `${parte} piñas`,
      d: [`${parte + dens} piñas`, `${total - parte} piñas`, `${parte - num} piñas`],
      pista: `Para ${num}/${dens} de ${total}: dividí ${total} entre ${dens}, luego multiplicá por ${num}.`,
      pasos: [
        { titulo: 'Comprender',  explicacion: `Queremos ${num}/${dens} de ${total}.` },
        { titulo: 'Plantear',    explicacion: `${total} ÷ ${dens} × ${num}` },
        { titulo: 'Resolver',    explicacion: `${total} ÷ ${dens} = ${total / dens}. × ${num} = ${parte}.` },
        { titulo: 'Verificar',   explicacion: `${parte} ÷ ${total} = ${num}/${dens}. ✓` }
      ]
    };
  }

  // tipo 7
  const x = r(3, 20), b = r(5, 30);
  const resultado = x + b;
  return {
    ctx: `En un juego matemático del SDBHS, la profesora escribe una ecuación en la pizarra.`,
    enunciado: `Si □ + ${b} = ${resultado}, ¿cuál es el valor de □?`,
    correcta: `${x}`,
    d: [`${x + 2}`, `${x - 1}`, `${resultado}`],
    pista: `¿Qué número más ${b} da ${resultado}?`,
    pasos: [
      { titulo: 'Comprender',  explicacion: `□ + ${b} = ${resultado}. Buscamos □.` },
      { titulo: 'Plantear',    explicacion: `□ = ${resultado} - ${b}` },
      { titulo: 'Resolver',    explicacion: `${resultado} - ${b} = ${x}` },
      { titulo: 'Verificar',   explicacion: `${x} + ${b} = ${resultado}. ✓` }
    ]
  };
}

// ══════════════════════════════════════════════════════════════
//  PROMPTS POR MATERIA
// ══════════════════════════════════════════════════════════════

function buildPrompt(materiaLabel, nivel, bloque, afirmacion, reglasExtra) {
  const nivelLabel = nivel === 'secundaria'
    ? 'estudiantes de 11° año de secundaria (colegios académicos diurnos y técnicos de Costa Rica)'
    : 'estudiantes de 6° grado de primaria de Costa Rica';

  return `Eres un evaluador experto del Ministerio de Educación Pública de Costa Rica (MEP), especializado en la construcción de ítems de selección única para las Pruebas Nacionales Estandarizadas ${nivel === 'secundaria' ? 'Sumativas' : 'Diagnósticas'} 2026 (DGEC) para ${nivelLabel}.

MATERIA: ${materiaLabel}
BLOQUE TEMÁTICO: ${bloque}
AFIRMACIÓN/EVIDENCIA A EVALUAR: ${afirmacion}

REGLAS PEDAGÓGICAS:
${reglasExtra}

REGLAS TÉCNICAS OBLIGATORIAS:
- El ítem debe evaluar comprensión, análisis o inferencia — NUNCA memorización directa de nombres o definiciones.
- El ítem debe plantear un CONTEXTO real o situación concreta antes de la pregunta (Diseño Centrado en Evidencias DGEC).
- 4 opciones (A, B, C, D): exactamente una correcta (clave) y tres distractores plausibles que representen errores conceptuales típicos del nivel evaluado.
- La clave correcta NO debe ser siempre la opción A — variá la posición en cada ítem.
- Dificultad: intermedia-avanzada según la escala IDEA-250.
- Los pasos de resolución deben explicar el razonamiento correcto con claridad pedagógica.

${JSON_SCHEMA}`;
}

// ══════════════════════════════════════════════════════════════
//  RUTA UNIFICADA: POST /api/generar
// ══════════════════════════════════════════════════════════════

app.post('/api/generar', async (req, res) => {
  const { materia, bloque, afirmacion, nivel = 'primaria' } = req.body;

  try {
    // ── MATEMÁTICAS PRIMARIA (plantillas exactas) ────────────
    if (materia === 'mat') {
      const ej = crearEjercicioMatPrimaria();

      let contexto = ej.ctx;
      try {
        const c = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile', max_tokens: 120, temperature: 0.8,
          messages: [{ role: 'user', content: `Reescribí este contexto con más detalle costarricense (máximo 2 oraciones, sin cambiar los números): "${ej.ctx}". Respondé SOLO con el texto reescrito.` }]
        });
        const t = c.choices[0]?.message?.content?.trim();
        if (t && t.length > 10) contexto = t;
      } catch (_) {}

      const { opciones, clave } = mezclar({ A: ej.correcta, B: ej.d[0], C: ej.d[1], D: ej.d[2] }, 'A');
      return res.json({ contexto_situacional: contexto, enunciado: ej.enunciado, opciones, clave, pista: ej.pista, pasos_resolucion: ej.pasos });
    }

    // ── ESPAÑOL PRIMARIA ─────────────────────────────────────
    if (materia === 'esp') {
      const reglas = `- El campo "contexto_situacional" DEBE contener un texto original de 4 a 7 oraciones para que el estudiante lo lea.
- El texto puede ser narrativo o informativo, con temática costarricense preferiblemente.
- La pregunta NUNCA puede responderse sin leer el texto: evalúa inferencia, idea principal, causa-efecto o comportamiento de personajes.
- Los distractores deben parecer correctos pero no sustentarse en el texto.`;
      const ejercicio = await generarConIA(buildPrompt('Español — Comprensión Lectora', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── CIENCIAS PRIMARIA ────────────────────────────────────
    if (materia === 'cien') {
      const reglas = `- Usá OBLIGATORIAMENTE un contexto de la biodiversidad, naturaleza o geografía de Costa Rica (Parque Nacional Corcovado, volcán Arenal, quetzal, manglares, etc.).
- El contexto debe describir una situación observable, experimento o dato de la naturaleza.
- Evaluá comprensión y aplicación de conceptos científicos, NO memorización de nombres.
- Incluí datos concretos que el estudiante deba analizar.`;
      const ejercicio = await generarConIA(buildPrompt('Ciencias Naturales', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── ESTUDIOS SOCIALES PRIMARIA ───────────────────────────
    if (materia === 'ss') {
      const reglas = `- Usá OBLIGATORIAMENTE un contexto histórico, geográfico o ciudadano de Costa Rica.
- El contexto puede ser: una cita histórica breve, descripción de un lugar, situación ciudadana cotidiana o dato estadístico nacional.
- Evaluá comprensión, análisis e inferencia — no reconocimiento de datos aislados.
- Los distractores deben representar confusiones comunes en estudiantes de 6° sobre historia y geografía costarricense.`;
      const ejercicio = await generarConIA(buildPrompt('Estudios Sociales', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── MATEMÁTICAS SECUNDARIA ───────────────────────────────
    if (materia === 'sec-mat') {
      const reglas = `- Planteá un problema en un contexto real y cotidiano (economía doméstica, tecnología, deporte, estadísticas nacionales de Costa Rica).
- El ítem debe requerir el uso de funciones, transformaciones geométricas, estadística o probabilidad a nivel de undécimo año.
- Incluí datos numéricos concretos (tabla, gráfica descrita, ecuación) que el estudiante deba analizar o resolver.
- Para problemas de cálculo: VERIFICÁ que la respuesta correcta sea matemáticamente exacta antes de escribirla.
- Los distractores deben representar errores algebraicos típicos de undécimo (signo, orden de operaciones, confusión de conceptos).`;
      const ejercicio = await generarConIA(buildPrompt('Matemáticas', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── ESPAÑOL SECUNDARIA ───────────────────────────────────
    if (materia === 'sec-esp') {
      const reglas = `- El campo "contexto_situacional" DEBE contener un texto original de 5 a 8 oraciones (literario o no literario).
- Para bloques de recursos retóricos: el texto debe incluir la figura literaria subrayada o marcada con [corchetes] que el estudiante debe interpretar.
- Para bloques de comprensión literal o inferencia: el texto debe ser lo suficientemente complejo como para que la respuesta correcta requiera análisis profundo, no solo lectura superficial.
- La pregunta debe evaluar el nivel cognitivo descrito en la afirmación (reorganizar, inferir, interpretar, analizar).
- Los distractores deben representar lecturas superficiales o interpretaciones parciales del texto.`;
      const ejercicio = await generarConIA(buildPrompt('Español — Comprensión Lectora', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── CIENCIAS SECUNDARIA (Tabla 7) ────────────────────────
    if (materia === 'sec-cien') {
      const reglas = `- Usá siempre un contexto situacional real: experimento de laboratorio, fenómeno natural costarricense, dato científico de actualidad o situación cotidiana.
- Para Física: planteá datos numéricos concretos. VERIFICÁ que los cálculos sean correctos.
- Para Química: usá sustancias o compuestos comunes o relevantes para Costa Rica (agricultura, industria alimentaria).
- Para Biología: usá especies, ecosistemas o datos de biodiversidad costarricense cuando sea posible.
- El ítem debe evaluar comprensión, aplicación o análisis — NUNCA definición memorística.
- Los distractores deben representar errores conceptuales típicos de undécimo (confusión de conceptos relacionados, error de cálculo común, aplicación incorrecta de una ley).`;
      const ejercicio = await generarConIA(buildPrompt('Ciencias (Física, Química y Biología)', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── ESTUDIOS SOCIALES SECUNDARIA ─────────────────────────
    if (materia === 'sec-ss') {
      const reglas = `- Usá SIEMPRE un contexto textual concreto: cita histórica, estadística, mapa descrito, noticia o caso real.
- El ítem debe presentar la información en el enunciado — el estudiante no debe depender de memorización pura.
- Evaluá análisis, inferencia o comprensión de causas/consecuencias históricas o geopolíticas.
- Para temas de Costa Rica: relacioná con la realidad actual o con impacto en la vida cotidiana costarricense.
- Los distractores deben ser respuestas históricamente plausibles pero incorrectas para el contexto planteado.`;
      const ejercicio = await generarConIA(buildPrompt('Estudios Sociales', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── EDUCACIÓN CÍVICA SECUNDARIA ──────────────────────────
    if (materia === 'sec-civ') {
      const reglas = `- Planteá SIEMPRE un caso ciudadano concreto, dilema democrático, situación política o noticia ficticia verosímil de Costa Rica o el mundo.
- El estudiante debe analizar la situación y aplicar conocimiento cívico para responder — no solo reconocer definiciones.
- Para temas de institucionalidad: usá casos donde se evidencien funciones reales de los poderes del Estado o el TSE.
- Para temas de derechos: planteá situaciones donde se protejan o vulneren derechos fundamentales.
- Los distractores deben representar confusiones conceptuales comunes sobre el sistema político costarricense (ej. confundir funciones de poderes, mecanismos electorales, etc.).`;
      const ejercicio = await generarConIA(buildPrompt('Educación Cívica', nivel, bloque, afirmacion, reglas));
      const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
      return res.json({ ...ejercicio, opciones, clave });
    }

    // ── MATERIA NO RECONOCIDA ────────────────────────────────
    return res.status(400).json({ error: `Materia no reconocida: ${materia}` });

  } catch (err) {
    console.error(`[/api/generar] Error materia=${materia}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ TutoríaPRO v2 corriendo en http://localhost:${PORT}`);
  console.log(`   Materias: mat · esp · cien · ss · sec-mat · sec-esp · sec-cien · sec-ss · sec-civ`);
});
