const fetch = require('node-fetch');

// ══════════════════════════════════════════════════════════
//  GENERADOR DE EJERCICIOS MATEMÁTICAMENTE CORRECTOS
//  El servidor genera los números y calcula la respuesta.
//  El modelo solo redacta el contexto narrativo.
// ══════════════════════════════════════════════════════════

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

// ── Plantillas matemáticamente correctas ─────────────────
function generarEjercicio(bloqueNombre, afirmacion) {
  const plantillas = [

    // NÚMEROS: División con resto
    () => {
      const total = rand(200, 999);
      const divisor = rand(6, 20);
      const cociente = Math.floor(total / divisor);
      const resto = total % divisor;
      const d1 = cociente + 1;
      const d2 = cociente - 1;
      const d3 = Math.floor(total / (divisor + 1));
      return {
        datos: { total, divisor, cociente, resto },
        enunciado: `Se tienen {total} objetos que deben distribuirse en grupos de {divisor} cada uno. ¿Cuántos grupos completos se pueden formar?`,
        respuesta: `${cociente} grupos`,
        distractores: [`${d1} grupos`, `${d2} grupos`, `${d3} grupos`],
        pista: `Pensá: ¿cuántas veces cabe {divisor} en {total}? Usá la división.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos {total} objetos y queremos formar grupos de {divisor}. Necesitamos saber cuántos grupos completos caben.` },
          { titulo: 'Plantear la operación', explicacion: `Dividimos el total entre el tamaño del grupo: {total} ÷ {divisor}` },
          { titulo: 'Resolver', explicacion: `{total} ÷ {divisor} = ${cociente} con resto ${resto}. Solo contamos los grupos completos.` },
          { titulo: 'Verificar', explicacion: `${cociente} × {divisor} = ${cociente * divisor}, más el resto ${resto} = {total}. ✓ La respuesta es ${cociente} grupos.` }
        ]
      };
    },

    // NÚMEROS: Porcentaje
    () => {
      const total = rand(200, 800);
      const pct = [10, 20, 25, 50][rand(0, 3)];
      const resultado = (total * pct) / 100;
      return {
        datos: { total, pct, resultado },
        enunciado: `En una tienda hay {total} artículos. El {pct}% de ellos están en oferta. ¿Cuántos artículos están en oferta?`,
        respuesta: `${resultado} artículos`,
        distractores: [`${resultado + pct} artículos`, `${total - resultado} artículos`, `${resultado * 2} artículos`],
        pista: `Para calcular el {pct}% de {total}, podés multiplicar {total} × {pct} y dividir entre 100.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Queremos encontrar el {pct}% de {total} artículos.` },
          { titulo: 'Plantear la operación', explicacion: `Porcentaje: {total} × {pct} ÷ 100` },
          { titulo: 'Resolver', explicacion: `{total} × {pct} = ${total * pct}. Luego ${total * pct} ÷ 100 = ${resultado}.` },
          { titulo: 'Verificar', explicacion: `El ${pct}% de {total} es ${resultado}. Si sumamos: ${resultado} + ${total - resultado} = {total}. ✓` }
        ]
      };
    },

    // MEDIDAS: Conversión de tiempo
    () => {
      const horas = rand(2, 8);
      const minutos = rand(1, 59);
      const totalMin = horas * 60 + minutos;
      return {
        datos: { horas, minutos, totalMin },
        enunciado: `Una actividad dura {horas} horas y {minutos} minutos. ¿Cuántos minutos dura en total?`,
        respuesta: `${totalMin} minutos`,
        distractores: [`${totalMin + 10} minutos`, `${horas * 60} minutos`, `${totalMin - 10} minutos`],
        pista: `Recordá que 1 hora = 60 minutos. Convertí las horas a minutos y sumá los minutos adicionales.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos {horas} horas y {minutos} minutos. Queremos el total en minutos.` },
          { titulo: 'Plantear la operación', explicacion: `Convertir horas: {horas} × 60. Luego sumar los minutos extra.` },
          { titulo: 'Resolver', explicacion: `{horas} × 60 = ${horas * 60} minutos. Más {minutos} minutos = ${totalMin} minutos.` },
          { titulo: 'Verificar', explicacion: `${horas * 60} + {minutos} = ${totalMin}. ✓` }
        ]
      };
    },

    // MEDIDAS: Conversión kg a g
    () => {
      const kg = rand(2, 15);
      const g = rand(100, 900);
      const totalG = kg * 1000 + g;
      return {
        datos: { kg, g, totalG },
        enunciado: `Una compra pesa {kg} kg y {g} g. ¿Cuántos gramos pesa en total?`,
        respuesta: `${totalG} g`,
        distractores: [`${kg * 1000} g`, `${totalG + 100} g`, `${totalG - 100} g`],
        pista: `Recordá que 1 kg = 1000 g. Convertí los kilogramos a gramos primero.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos {kg} kg y {g} g. Queremos todo en gramos.` },
          { titulo: 'Plantear la operación', explicacion: `Convertir: {kg} × 1000. Luego sumar {g} g.` },
          { titulo: 'Resolver', explicacion: `{kg} × 1000 = ${kg * 1000} g. Más {g} g = ${totalG} g.` },
          { titulo: 'Verificar', explicacion: `${kg * 1000} + {g} = ${totalG} g. ✓` }
        ]
      };
    },

    // GEOMETRÍA: Área de rectángulo
    () => {
      const base = rand(5, 30);
      const altura = rand(3, 20);
      const area = base * altura;
      const perim = 2 * (base + altura);
      return {
        datos: { base, altura, area, perim },
        enunciado: `Un terreno rectangular mide {base} m de base y {altura} m de altura. ¿Cuál es su área?`,
        respuesta: `${area} m²`,
        distractores: [`${perim} m²`, `${area + base} m²`, `${area - altura} m²`],
        pista: `El área de un rectángulo se calcula multiplicando la base por la altura.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos un rectángulo de {base} m × {altura} m. Queremos el área.` },
          { titulo: 'Plantear la operación', explicacion: `Área = base × altura = {base} × {altura}` },
          { titulo: 'Resolver', explicacion: `{base} × {altura} = ${area} m²` },
          { titulo: 'Verificar', explicacion: `${area} ÷ {base} = {altura}. ✓ El área es ${area} m².` }
        ]
      };
    },

    // RELACIONES Y ÁLGEBRA: Patrón numérico
    () => {
      const inicio = rand(2, 20);
      const incremento = rand(3, 15);
      const n1 = inicio;
      const n2 = inicio + incremento;
      const n3 = inicio + incremento * 2;
      const n4 = inicio + incremento * 3;
      const n5 = inicio + incremento * 4;
      return {
        datos: { inicio, incremento, n1, n2, n3, n4, n5 },
        enunciado: `Observá la siguiente sucesión: ${n1}, ${n2}, ${n3}, ${n4}, ___ . ¿Cuál es el número que sigue?`,
        respuesta: `${n5}`,
        distractores: [`${n5 + incremento}`, `${n5 - 1}`, `${n4 + incremento - 1}`],
        pista: `Calculá la diferencia entre cada par de números consecutivos. ¿Es siempre la misma?`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos la sucesión ${n1}, ${n2}, ${n3}, ${n4} y debemos encontrar el siguiente.` },
          { titulo: 'Identificar el patrón', explicacion: `${n2} - ${n1} = ${incremento}. ${n3} - ${n2} = ${incremento}. ${n4} - ${n3} = ${incremento}. El incremento es siempre ${incremento}.` },
          { titulo: 'Resolver', explicacion: `El siguiente número es ${n4} + ${incremento} = ${n5}.` },
          { titulo: 'Verificar', explicacion: `La sucesión completa: ${n1}, ${n2}, ${n3}, ${n4}, ${n5}. Diferencia constante de ${incremento}. ✓` }
        ]
      };
    },

    // ESTADÍSTICA: Media aritmética
    () => {
      const a = rand(10, 50);
      const b = rand(10, 50);
      const c = rand(10, 50);
      const d = rand(10, 50);
      const suma = a + b + c + d;
      const media = suma / 4;
      if (!Number.isInteger(media)) {
        // Ajustar d para que la media sea entera
        const nuevaD = (Math.round(media) * 4) - a - b - c;
        if (nuevaD > 0 && nuevaD < 100) {
          const nuevaSuma = a + b + c + nuevaD;
          const nuevaMedia = nuevaSuma / 4;
          return {
            datos: { a, b, c, d: nuevaD, suma: nuevaSuma, media: nuevaMedia },
            enunciado: `En cuatro pruebas, un estudiante obtuvo las siguientes notas: ${a}, ${b}, ${c} y ${nuevaD}. ¿Cuál es el promedio (media aritmética)?`,
            respuesta: `${nuevaMedia}`,
            distractores: [`${nuevaMedia + 2}`, `${nuevaMedia - 1}`, `${Math.max(a, b, c, nuevaD)}`],
            pista: `La media aritmética se calcula sumando todos los valores y dividiendo entre la cantidad de datos.`,
            pasos: [
              { titulo: 'Comprender el problema', explicacion: `Tenemos 4 notas: ${a}, ${b}, ${c} y ${nuevaD}. Queremos el promedio.` },
              { titulo: 'Plantear la operación', explicacion: `Media = suma de todos los datos ÷ cantidad de datos` },
              { titulo: 'Resolver', explicacion: `Suma: ${a} + ${b} + ${c} + ${nuevaD} = ${nuevaSuma}. Media: ${nuevaSuma} ÷ 4 = ${nuevaMedia}.` },
              { titulo: 'Verificar', explicacion: `${nuevaMedia} × 4 = ${nuevaSuma}. ✓ El promedio es ${nuevaMedia}.` }
            ]
          };
        }
      }
      const mediaFinal = Math.round(media);
      return {
        datos: { a, b, c, d, suma, media: mediaFinal },
        enunciado: `En cuatro pruebas, un estudiante obtuvo: ${a}, ${b}, ${c} y ${d}. ¿Cuál es el promedio aproximado?`,
        respuesta: `${mediaFinal}`,
        distractores: [`${mediaFinal + 3}`, `${mediaFinal - 2}`, `${Math.max(a, b, c, d)}`],
        pista: `Sumá todas las notas y dividí entre 4.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos 4 notas: ${a}, ${b}, ${c} y ${d}.` },
          { titulo: 'Plantear la operación', explicacion: `Media = (${a} + ${b} + ${c} + ${d}) ÷ 4` },
          { titulo: 'Resolver', explicacion: `Suma: ${suma}. Media: ${suma} ÷ 4 ≈ ${mediaFinal}.` },
          { titulo: 'Verificar', explicacion: `El promedio de ${a}, ${b}, ${c} y ${d} es aproximadamente ${mediaFinal}. ✓` }
        ]
      };
    },

    // NÚMEROS: Fracciones - parte de una colección
    () => {
      const denominador = [2, 3, 4, 5][rand(0, 3)];
      const numerador = rand(1, denominador - 1);
      const total = denominador * rand(5, 20);
      const parte = (total * numerador) / denominador;
      return {
        datos: { numerador, denominador, total, parte },
        enunciado: `En una canasta hay {total} frutas. Si {numerador}/{denominador} de las frutas son mangos, ¿cuántos mangos hay?`,
        respuesta: `${parte} mangos`,
        distractores: [`${parte + denominador} mangos`, `${total - parte} mangos`, `${parte - numerador} mangos`],
        pista: `Para encontrar una fracción de un número, dividí el total entre el denominador y multiplicá por el numerador.`,
        pasos: [
          { titulo: 'Comprender el problema', explicacion: `Tenemos {total} frutas. Queremos saber cuántas son {numerador}/{denominador} del total.` },
          { titulo: 'Plantear la operación', explicacion: `Primero dividimos: {total} ÷ {denominador}. Luego multiplicamos por {numerador}.` },
          { titulo: 'Resolver', explicacion: `{total} ÷ {denominador} = ${total / denominador}. Luego ${total / denominador} × {numerador} = ${parte}.` },
          { titulo: 'Verificar', explicacion: `${parte} ÷ {total} = ${numerador / denominador} = {numerador}/{denominador}. ✓` }
        ]
      };
    }
  ];

  // Seleccionar plantilla aleatoria
  const plantilla = plantillas[rand(0, plantillas.length - 1)]();

  // Reemplazar variables en los textos
  function reemplazar(texto, datos) {
    return texto.replace(/\{(\w+)\}/g, (_, key) => datos[key] !== undefined ? datos[key] : `{${key}}`);
  }

  const enunciado = reemplazar(plantilla.enunciado, plantilla.datos);
  const pista     = reemplazar(plantilla.pista, plantilla.datos);
  const pasos     = plantilla.pasos.map(p => ({
    titulo:      p.titulo,
    explicacion: reemplazar(p.explicacion, plantilla.datos)
  }));

  // Armar opciones con la correcta en posición A (se mezclará después)
  const opciones = {
    A: plantilla.respuesta,
    B: plantilla.distractores[0],
    C: plantilla.distractores[1],
    D: plantilla.distractores[2]
  };

  return { enunciado, pista, pasos_resolucion: pasos, opciones, clave: 'A', local: true };
}

// ── Enriquecer con contexto narrativo via IA ──────────────
async function enriquecerConIA(ejercicioBase, bloque, afirmacion) {
  const prompt = `Tenés este ejercicio matemático ya resuelto:
ENUNCIADO: ${ejercicioBase.enunciado}
RESPUESTA CORRECTA: ${ejercicioBase.opciones.A}

Tu tarea es SOLO reescribir el enunciado con un contexto narrativo costarricense más rico (2-3 oraciones de contexto situacional antes de la pregunta), manteniendo EXACTAMENTE los mismos números y la misma pregunta matemática.

Bloque: ${bloque} | Afirmación: ${afirmacion}

Responde SOLO con JSON:
{"contexto_situacional":"el contexto narrativo costarricense","enunciado":"la pregunta matemática exacta sin cambiar números"}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const datos = await res.json();
    const texto = datos.choices?.[0]?.message?.content || '';
    const ini = texto.indexOf('{'), fin = texto.lastIndexOf('}');
    if (ini !== -1 && fin !== -1) {
      const enriquecido = JSON.parse(texto.substring(ini, fin + 1));
      return {
        contexto_situacional: enriquecido.contexto_situacional || '',
        enunciado: enriquecido.enunciado || ejercicioBase.enunciado
      };
    }
  } catch(e) { /* Si falla la IA, usar el texto base */ }

  return { contexto_situacional: '', enunciado: ejercicioBase.enunciado };
}

// ── Handler principal ─────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { bloque, afirmacion } = req.body;

  try {
    // 1. Generar ejercicio matemáticamente correcto
    const ejercicioBase = generarEjercicio(bloque, afirmacion);

    // 2. Enriquecer con contexto narrativo via IA
    const { contexto_situacional, enunciado } = await enriquecerConIA(ejercicioBase, bloque, afirmacion);

    // 3. Mezclar opciones aleatoriamente
    const { opciones, clave } = mezclarOpciones(ejercicioBase.opciones, ejercicioBase.clave);

    return res.status(200).json({
      contexto_situacional,
      enunciado,
      opciones,
      clave,
      pista:            ejercicioBase.pista,
      pasos_resolucion: ejercicioBase.pasos_resolucion
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
