// ══════════════════════════════════════════════════════════════
//  TutoríaPRO — Backend Principal
//  SDBHS · DGEC 2026 · Node.js + Express + Groq SDK
// ══════════════════════════════════════════════════════════════

import express    from 'express';
import cors       from 'cors';
import dotenv     from 'dotenv';
import Groq       from 'groq-sdk';
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

// ── UTILIDAD: Mezclar opciones aleatoriamente ─────────────────
function mezclar(opciones, claveOriginal) {
  const letras  = ['A', 'B', 'C', 'D'];
  const textos  = letras.map(l => opciones[l]);
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

// ── UTILIDAD: Generar con IA (Groq) ──────────────────────────
async function generarConIA(materia, bloque, afirmacion, reglasExtra) {
  const prompt = `Eres un evaluador experto del Ministerio de Educación Pública de Costa Rica (MEP), especializado en la construcción de ítems de selección única para las Pruebas Nacionales Estandarizadas Diagnósticas 2026 (DGEC), para estudiantes de 6° grado de primaria.

MATERIA: ${materia}
BLOQUE: ${bloque}
AFIRMACIÓN A EVALUAR: ${afirmacion}

REGLAS PEDAGÓGICAS DGEC:
${reglasExtra}

REGLAS TÉCNICAS OBLIGATORIAS:
- El ítem debe evaluar comprensión, análisis o inferencia — NO memorización directa.
- 4 opciones (A, B, C, D): exactamente una correcta (clave) y tres distractores plausibles que representen errores conceptuales típicos de estudiantes de 6° grado.
- Dificultad: intermedia-avanzada, según la escala IDEA-250.
- La clave correcta NO debe ser siempre la opción A; variá la posición.
- VERIFICÁ que la clave sea matemática y conceptualmente correcta antes de responder.

Respondé ÚNICAMENTE con este objeto JSON exacto, sin backticks, sin texto extra:
{
  "contexto_situacional": "...",
  "enunciado": "...",
  "opciones": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "clave": "A",
  "pista": "...",
  "pasos_resolucion": [
    { "titulo": "...", "explicacion": "..." },
    { "titulo": "...", "explicacion": "..." },
    { "titulo": "...", "explicacion": "..." },
    { "titulo": "...", "explicacion": "..." }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model:           'llama-3.3-70b-versatile',
    max_tokens:      1800,
    temperature:     0.85,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }]
  });

  const texto = completion.choices[0]?.message?.content || '';
  const ini   = texto.indexOf('{');
  const fin   = texto.lastIndexOf('}');
  if (ini === -1 || fin === -1) throw new Error('Respuesta sin JSON válido');
  return JSON.parse(texto.substring(ini, fin + 1));
}

// ══════════════════════════════════════════════════════════════
//  RUTA: MATEMÁTICAS (plantillas exactas — sin IA para cálculos)
// ══════════════════════════════════════════════════════════════
function crearEjercicioMat() {
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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
        { titulo: 'Comprender', explicacion: `Tenemos ${total} naranjas y bolsas de ${div}. Queremos saber cuántas bolsas completas obtenemos.` },
        { titulo: 'Plantear', explicacion: `Dividimos el total entre el tamaño de cada bolsa: ${total} ÷ ${div}` },
        { titulo: 'Resolver', explicacion: `${total} ÷ ${div} = ${cociente} con un resto de ${resto}. Solo contamos las bolsas completas.` },
        { titulo: 'Verificar', explicacion: `${cociente} × ${div} = ${cociente * div}. Más ${resto} sobrantes = ${total} naranjas. ✓` }
      ]
    };
  }

  if (tipo === 1) {
    const pct  = [10, 20, 25, 50][r(0, 3)];
    const total = pct === 25 ? r(4, 20) * 4 : pct === 50 ? r(4, 20) * 2 : r(5, 30) * 10;
    const res   = (total * pct) / 100;
    return {
      ctx: `En la soda escolar del SDBHS se vendieron ${total} refrescos durante la semana.`,
      enunciado: `Si el ${pct}% de los refrescos vendidos eran de cas, ¿cuántos refrescos de cas se vendieron?`,
      correcta: `${res} refrescos`,
      d: [`${res + pct} refrescos`, `${total - res} refrescos`, `${res + 10} refrescos`],
      pista: `Para calcular el ${pct}% de ${total}, multiplicá ${total} × ${pct} y dividí el resultado entre 100.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Queremos encontrar el ${pct}% de ${total} refrescos.` },
        { titulo: 'Plantear', explicacion: `Porcentaje: ${total} × ${pct} ÷ 100` },
        { titulo: 'Resolver', explicacion: `${total} × ${pct} = ${total * pct}. Luego ${total * pct} ÷ 100 = ${res}.` },
        { titulo: 'Verificar', explicacion: `${res} es el ${pct}% de ${total}. ✓` }
      ]
    };
  }

  if (tipo === 2) {
    const horas = r(1, 8), mins = r(5, 55);
    const totalMin = horas * 60 + mins;
    return {
      ctx: `El viaje en autobús desde San José hasta Liberia, Guanacaste dura ${horas} horas y ${mins} minutos.`,
      enunciado: `¿Cuántos minutos dura el viaje en total?`,
      correcta: `${totalMin} minutos`,
      d: [`${horas * 60} minutos`, `${totalMin + 10} minutos`, `${totalMin - 5} minutos`],
      pista: `Recordá que 1 hora equivale a 60 minutos. Convertí las horas y sumá los minutos adicionales.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Tenemos ${horas} horas y ${mins} minutos. Queremos el total en minutos.` },
        { titulo: 'Plantear', explicacion: `${horas} horas × 60 minutos/hora + ${mins} minutos` },
        { titulo: 'Resolver', explicacion: `${horas} × 60 = ${horas * 60}. Más ${mins} = ${totalMin} minutos.` },
        { titulo: 'Verificar', explicacion: `${horas * 60} + ${mins} = ${totalMin}. ✓` }
      ]
    };
  }

  if (tipo === 3) {
    const base = r(4, 25), altura = r(3, 15);
    const area = base * altura, perim = 2 * (base + altura);
    return {
      ctx: `Una familia de Cartago tiene un jardín rectangular frente a su casa que mide ${base} metros de largo y ${altura} metros de ancho.`,
      enunciado: `¿Cuál es el área del jardín?`,
      correcta: `${area} m²`,
      d: [`${perim} m²`, `${area + base} m²`, `${area - altura} m²`],
      pista: `El área de un rectángulo se calcula multiplicando la base por la altura: Área = b × h`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Jardín de ${base} m × ${altura} m. Queremos el área.` },
        { titulo: 'Plantear', explicacion: `Área = base × altura = ${base} × ${altura}` },
        { titulo: 'Resolver', explicacion: `${base} × ${altura} = ${area} m²` },
        { titulo: 'Verificar', explicacion: `${area} ÷ ${base} = ${altura}. ✓ El área es ${area} m².` }
      ]
    };
  }

  if (tipo === 4) {
    const inc = r(3, 15), ini = r(2, 20);
    const seq = [0, 1, 2, 3, 4].map(i => ini + inc * i);
    return {
      ctx: `La profesora Patricia propone a sus estudiantes de 6° encontrar el patrón de la siguiente sucesión numérica.`,
      enunciado: `¿Cuál es el número que sigue en la sucesión? ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ___`,
      correcta: `${seq[4]}`,
      d: [`${seq[4] + inc}`, `${seq[4] - 1}`, `${seq[3] + inc - 1}`],
      pista: `Calculá la diferencia entre cada par de números consecutivos. ¿Es siempre la misma?`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Sucesión: ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}. Buscamos el siguiente.` },
        { titulo: 'Identificar patrón', explicacion: `${seq[1]}-${seq[0]}=${inc}, ${seq[2]}-${seq[1]}=${inc}, ${seq[3]}-${seq[2]}=${inc}. Incremento constante: ${inc}.` },
        { titulo: 'Resolver', explicacion: `${seq[3]} + ${inc} = ${seq[4]}.` },
        { titulo: 'Verificar', explicacion: `Sucesión completa: ${seq.join(', ')}. ✓` }
      ]
    };
  }

  if (tipo === 5) {
    const kg = r(2, 10), g = r(100, 900);
    const totalG = kg * 1000 + g;
    return {
      ctx: `En el supermercado La Colonia de Heredia, una bolsa de frijoles negros pesa ${kg} kg y ${g} g.`,
      enunciado: `¿Cuántos gramos pesa la bolsa en total?`,
      correcta: `${totalG} g`,
      d: [`${kg * 1000} g`, `${totalG + 100} g`, `${totalG - 50} g`],
      pista: `Recordá que 1 kg equivale a 1000 g. Convertí los kilogramos a gramos y sumá los gramos adicionales.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Tenemos ${kg} kg y ${g} g. Queremos todo en gramos.` },
        { titulo: 'Plantear', explicacion: `${kg} kg × 1000 g/kg + ${g} g` },
        { titulo: 'Resolver', explicacion: `${kg} × 1000 = ${kg * 1000}. Más ${g} = ${totalG} g.` },
        { titulo: 'Verificar', explicacion: `${kg * 1000} + ${g} = ${totalG} g. ✓` }
      ]
    };
  }

  if (tipo === 6) {
    const dens  = [2, 4, 5][r(0, 2)];
    const num   = r(1, dens - 1);
    const total = dens * r(4, 12);
    const parte = (total * num) / dens;
    return {
      ctx: `En el Festival de las Frutas de Quepos, una canasta tiene ${total} frutas tropicales variadas.`,
      enunciado: `Si ${num}/${dens} de las frutas son piñas, ¿cuántas piñas hay en la canasta?`,
      correcta: `${parte} piñas`,
      d: [`${parte + dens} piñas`, `${total - parte} piñas`, `${parte - num} piñas`],
      pista: `Para calcular ${num}/${dens} de ${total}: primero dividí ${total} entre ${dens}, luego multiplicá el resultado por ${num}.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Queremos ${num}/${dens} de ${total} frutas.` },
        { titulo: 'Plantear', explicacion: `${total} ÷ ${dens} × ${num}` },
        { titulo: 'Resolver', explicacion: `${total} ÷ ${dens} = ${total / dens}. Luego ${total / dens} × ${num} = ${parte}.` },
        { titulo: 'Verificar', explicacion: `${parte} ÷ ${total} = ${num / dens} = ${num}/${dens}. ✓` }
      ]
    };
  }

  // tipo 7: ecuación con incógnita
  const x = r(3, 20), b = r(5, 30);
  const resultado = x + b;
  return {
    ctx: `En un juego matemático del SDBHS, la profesora escribe una ecuación en la pizarra.`,
    enunciado: `Si □ + ${b} = ${resultado}, ¿cuál es el valor del □?`,
    correcta: `${x}`,
    d: [`${x + 2}`, `${x - 1}`, `${resultado}`],
    pista: `Para encontrar el valor desconocido, pensá: ¿qué número más ${b} da como resultado ${resultado}?`,
    pasos: [
      { titulo: 'Comprender', explicacion: `Tenemos □ + ${b} = ${resultado}. Buscamos el valor de □.` },
      { titulo: 'Plantear', explicacion: `□ = ${resultado} - ${b}` },
      { titulo: 'Resolver', explicacion: `${resultado} - ${b} = ${x}` },
      { titulo: 'Verificar', explicacion: `${x} + ${b} = ${resultado}. ✓` }
    ]
  };
}

// ══════════════════════════════════════════════════════════════
//  RUTAS API
// ══════════════════════════════════════════════════════════════

// ── POST /api/practica/matematicas ────────────────────────────
app.post('/api/practica/matematicas', async (req, res) => {
  try {
    const ej = crearEjercicioMat();

    // Enriquecer contexto narrativo con IA (opcional — usa el base si falla)
    let contexto = ej.ctx;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', max_tokens: 120, temperature: 0.8,
        messages: [{ role: 'user', content: `Reescribí este contexto con más detalle costarricense (máximo 2 oraciones, sin cambiar los números): "${ej.ctx}". Respondé SOLO con el texto reescrito.` }]
      });
      const t = completion.choices[0]?.message?.content?.trim();
      if (t && t.length > 10) contexto = t;
    } catch (_) {}

    const { opciones, clave } = mezclar(
      { A: ej.correcta, B: ej.d[0], C: ej.d[1], D: ej.d[2] }, 'A'
    );

    res.json({
      contexto_situacional: contexto,
      enunciado:    ej.enunciado,
      opciones, clave,
      pista:        ej.pista,
      pasos_resolucion: ej.pasos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/practica/ciencias ───────────────────────────────
app.post('/api/practica/ciencias', async (req, res) => {
  const { bloque, afirmacion } = req.body;
  try {
    const reglasExtra = `
- Usá OBLIGATORIAMENTE un contexto de la naturaleza, biodiversidad o geografía de Costa Rica (Parque Nacional Corcovado, volcán Arenal, quetzal, pejibaye, etc.).
- El contexto debe describir una situación o fenómeno observable (experimento, dato de la naturaleza, situación cotidiana).
- Evaluá comprensión y aplicación de conceptos científicos, NO memorización de nombres.
- Incluí datos concretos (números, proporciones, descripciones) que el estudiante deba analizar.`;
    const ejercicio = await generarConIA('Ciencias', bloque, afirmacion, reglasExtra);
    const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = opciones; ejercicio.clave = clave;
    res.json(ejercicio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/practica/espanol ────────────────────────────────
app.post('/api/practica/espanol', async (req, res) => {
  const { bloque, afirmacion } = req.body;
  try {
    const reglasExtra = `
- El campo "contexto_situacional" DEBE contener un texto corto original de 4 a 7 oraciones para que el estudiante lo lea y responda la pregunta basándose en él.
- El texto puede ser narrativo (cuento, anécdota) o informativo (artículo breve, noticia), con temática costarricense preferiblemente.
- La pregunta NUNCA puede responderse sin leer el texto: evalúa inferencia, idea principal, causa-efecto, conflicto o comportamiento de personajes.
- Los distractores deben ser respuestas que parecen correctas pero no se sustentan en el texto.`;
    const ejercicio = await generarConIA('Español - Comprensión Lectora', bloque, afirmacion, reglasExtra);
    const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = opciones; ejercicio.clave = clave;
    res.json(ejercicio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/practica/sociales ───────────────────────────────
app.post('/api/practica/sociales', async (req, res) => {
  const { bloque, afirmacion } = req.body;
  try {
    const reglasExtra = `
- Usá OBLIGATORIAMENTE un contexto histórico, geográfico o ciudadano de Costa Rica.
- El contexto puede ser: una cita histórica breve, descripción de un lugar, situación ciudadana cotidiana o dato estadístico nacional.
- Evaluá comprensión, análisis e inferencia — no solo reconocimiento de datos aislados.
- Los distractores deben representar confusiones conceptuales comunes en estudiantes de 6° grado sobre historia y geografía de Costa Rica.`;
    const ejercicio = await generarConIA('Estudios Sociales', bloque, afirmacion, reglasExtra);
    const { opciones, clave } = mezclar(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = opciones; ejercicio.clave = clave;
    res.json(ejercicio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ TutoríaPRO corriendo en http://localhost:${PORT}`);
});
