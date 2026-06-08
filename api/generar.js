// TutoríaPRO — Vercel Serverless Function v2
// Materias primaria : mat, esp, cien, ss
// Materias secundaria: sec-mat, sec-esp, sec-cien, sec-ss, sec-civ

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mezclar(opciones, claveOriginal) {
  const letras = ['A','B','C','D'];
  const textos = letras.map(l => opciones[l]);
  for (let i = textos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = textos[i]; textos[i] = textos[j]; textos[j] = tmp;
  }
  const textoCorrecta = opciones[claveOriginal];
  const nuevas = {};
  let nuevaClave = '';
  letras.forEach(function(l, i) {
    nuevas[l] = textos[i];
    if (textos[i] === textoCorrecta) nuevaClave = l;
  });
  return { opciones: nuevas, clave: nuevaClave };
}

function garantizarUnicas(opciones) {
  const letras = ['A','B','C','D'];
  const vistos = {};
  const resultado = {};
  letras.forEach(function(l) {
    let val = opciones[l];
    let intento = 0;
    while (vistos[val] !== undefined && intento < 10) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        val = String(num + intento + 1) + val.replace(String(num), '').trim();
      } else {
        val = val + ' (' + (intento + 2) + ')';
      }
      intento++;
    }
    vistos[val] = true;
    resultado[l] = val;
  });
  return resultado;
}

async function llamarGroqConModelo(apiKey, prompt, modelo) {
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: modelo, max_tokens: 1500, temperature: 0.85,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  });
  return await groqRes.json();
}

function esErrorRateLimit(msg) {
  return msg && (msg.includes('rate') || msg.includes('limit') || msg.includes('decommissioned') || msg.includes('deprecated') || msg.includes('Invalid API Key') || msg.includes('invalid_api_key'));
}

async function llamarGroq(keys, prompt) {
  // Intentar cada key con cada modelo hasta que una funcione
  const modelos = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let ultimoError = 'Sin respuesta';

  for (var k = 0; k < keys.length; k++) {
    for (var m = 0; m < modelos.length; m++) {
      const datos = await llamarGroqConModelo(keys[k], prompt, modelos[m]);
      if (!datos.error) {
        // Éxito — procesar respuesta
        const texto = datos.choices && datos.choices[0] && datos.choices[0].message
          ? datos.choices[0].message.content || ''
          : '';
        const ini = texto.indexOf('{');
        const fin = texto.lastIndexOf('}');
        if (ini === -1 || fin === -1) { ultimoError = 'Sin JSON válido'; continue; }
        const ejercicio = JSON.parse(texto.substring(ini, fin + 1));
        if (!ejercicio.enunciado || !ejercicio.opciones || !ejercicio.clave) { ultimoError = 'JSON incompleto'; continue; }

        // Sanitizar opciones
        if (Array.isArray(ejercicio.opciones)) {
          var letras = ['A','B','C','D']; var opObj = {};
          ejercicio.opciones.forEach(function(val, i) { if (i < 4) opObj[letras[i]] = String(val); });
          ejercicio.opciones = opObj;
        }
        ['A','B','C','D'].forEach(function(l) {
          if (!ejercicio.opciones[l] || ejercicio.opciones[l] === 'undefined' || ejercicio.opciones[l].startsWith('Opción ')) {
            ejercicio.opciones[l] = 'Opción ' + l;
          }
        });

        // Sanitizar pasos
        if (!Array.isArray(ejercicio.pasos_resolucion)) ejercicio.pasos_resolucion = [];
        ejercicio.pasos_resolucion = ejercicio.pasos_resolucion.map(function(p) {
          return {
            titulo: p.titulo || p.paso || p.title || p.nombre || 'Paso',
            explicacion: p.explicacion || p.descripcion || p.explanation || p.detalle || p.contenido || p.texto || ''
          };
        });
        while (ejercicio.pasos_resolucion.length < 4) {
          ejercicio.pasos_resolucion.push({ titulo: 'Verificar', explicacion: 'Comprobá que la respuesta sea consistente con el contexto y el concepto evaluado.' });
        }

        // Sanitizar pista
        if (!ejercicio.pista || typeof ejercicio.pista !== 'string') {
          ejercicio.pista = 'Revisá el contexto y relacionalo con el concepto clave del bloque temático.';
        }

        // Eliminar referencias a letras en pasos
        ejercicio.pasos_resolucion = ejercicio.pasos_resolucion.map(function(p) {
          var exp = p.explicacion || '';
          exp = exp.replace(/la opci[oó]n [ABCD]/gi, 'la respuesta correcta');
          exp = exp.replace(/corresponde a [ABCD]/gi, 'es la respuesta correcta');
          exp = exp.replace(/opci[oó]n [ABCD]/gi, 'respuesta correcta');
          p.explicacion = exp;
          return p;
        });

        return ejercicio;
      }
      ultimoError = datos.error.message || 'Error desconocido';
      if (!esErrorRateLimit(ultimoError)) throw new Error(ultimoError);
      // Si es rate limit, probar siguiente modelo/key
    }
  }
  throw new Error('Límite de uso alcanzado en todas las keys. Intentá de nuevo en unos minutos.');
}
const JSON_SCHEMA = `Respondé SOLO con este JSON exacto, sin backticks, sin texto antes ni después.
REGLA CRÍTICA: en "pista" y en cada "explicacion" de pasos_resolucion JAMÁS escribas las letras A, B, C o D para referirte a opciones. Mencioná únicamente el contenido o valor correcto, nunca la letra.
{"contexto_situacional":"...","enunciado":"...","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"B","pista":"...","pasos_resolucion":[{"titulo":"...","explicacion":"..."},{"titulo":"...","explicacion":"..."},{"titulo":"...","explicacion":"..."},{"titulo":"...","explicacion":"..."}]}`;

// ══════════════════════════════════════════════════════════════
//  MATEMÁTICAS PRIMARIA — plantillas exactas (sin IA)
// ══════════════════════════════════════════════════════════════

function crearEjercicioMat() {
  var tipo = rand(0, 7);

  if (tipo === 0) {
    var total = rand(150, 600), div = rand(8, 25);
    var cociente = Math.floor(total / div), resto = total % div;
    var falta = div - resto;
    var d1 = falta + div, d2 = resto, d3 = falta + 2;
    if (d1 === falta) d1 = falta + div + 1;
    if (d2 === falta) d2 = resto + 1;
    return {
      ctx: 'La cooperativa de productores de piña de Puntarenas cosechó ' + total + ' piñas. Las cajas de exportación tienen capacidad para ' + div + ' piñas cada una. Las cajas incompletas no se pueden exportar.',
      enunciado: '¿Cuántas piñas le faltaron a la cooperativa para poder llenar una caja más y aumentar en uno el total de cajas exportadas?',
      correcta: falta + ' piñas', d: [d1 + ' piñas', d2 + ' piñas', d3 + ' piñas'],
      pista: 'Calculá cuántas cajas completas se llenaron y cuántas piñas sobraron. Luego: ¿cuántas faltarían para completar la siguiente caja?',
      pasos: [
        {titulo:'Dividir para encontrar cajas y sobrante', explicacion: total + ' ÷ ' + div + ' = ' + cociente + ' cajas completas, con ' + resto + ' piñas sobrantes.'},
        {titulo:'Analizar la caja incompleta', explicacion: 'La caja siguiente necesita ' + div + ' piñas pero solo hay ' + resto + '. Le faltan ' + div + ' - ' + resto + ' = ' + falta + ' piñas.'},
        {titulo:'Resolver', explicacion: 'Faltan ' + falta + ' piñas para completar la caja número ' + (cociente + 1) + '.'},
        {titulo:'Verificar', explicacion: resto + ' + ' + falta + ' = ' + div + ', exactamente la capacidad de una caja. ✓'}
      ]
    };
  }
  if (tipo === 1) {
    var pct = [20, 25, 30][rand(0, 2)];
    var precioBase = rand(3, 12) * 1000;
    var descuento = Math.round(precioBase * pct / 100);
    var precioDes = precioBase - descuento;
    var precioOtro = precioDes + rand(500, 2000);
    return {
      ctx: 'En la Feria del Agricultor de San José, un puesto vende aguacates a ₡' + precioBase.toLocaleString() + ' el kilo con descuento del ' + pct + '% por compras mayores a 2 kilos. En el puesto vecino el mismo aguacate cuesta ₡' + precioOtro.toLocaleString() + ' sin descuento.',
      enunciado: '¿Cuántos colones ahorra un comprador que adquiere 1 kilo con el descuento del ' + pct + '% en lugar de comprarlo sin descuento en el puesto vecino?',
      correcta: '₡' + (precioOtro - precioDes).toLocaleString(),
      d: ['₡' + descuento.toLocaleString(), '₡' + (precioOtro - precioBase).toLocaleString(), '₡' + precioDes.toLocaleString()],
      pista: 'Calculá el precio con descuento: ₡' + precioBase.toLocaleString() + ' - ' + pct + '% = ¿cuánto? Luego comparalo con ₡' + precioOtro.toLocaleString() + '.',
      pasos: [
        {titulo:'Calcular el descuento', explicacion: pct + '% de ₡' + precioBase.toLocaleString() + ' = ₡' + descuento.toLocaleString() + '.'},
        {titulo:'Precio con descuento', explicacion: '₡' + precioBase.toLocaleString() + ' - ₡' + descuento.toLocaleString() + ' = ₡' + precioDes.toLocaleString() + '.'},
        {titulo:'Comparar con el otro puesto', explicacion: '₡' + precioOtro.toLocaleString() + ' - ₡' + precioDes.toLocaleString() + ' = ₡' + (precioOtro - precioDes).toLocaleString() + ' de ahorro.'},
        {titulo:'Verificar', explicacion: 'Puesto con descuento: ₡' + precioDes.toLocaleString() + ' vs ₡' + precioOtro.toLocaleString() + '. Diferencia: ₡' + (precioOtro - precioDes).toLocaleString() + '. ✓'}
      ]
    };
  }
  if (tipo === 2) {
    var horasSalida = rand(5, 9), minsSalida = [0, 15, 30, 45][rand(0, 3)];
    var durHoras = rand(2, 5), durMins = [0, 20, 30, 40][rand(0, 3)];
    var llegadaMins = horasSalida * 60 + minsSalida + durHoras * 60 + durMins;
    var llegadaH = Math.floor(llegadaMins / 60) % 24, llegadaM = llegadaMins % 60;
    var fmtSalida = horasSalida + ':' + (minsSalida === 0 ? '00' : minsSalida);
    var fmtLlegada = llegadaH + ':' + (llegadaM === 0 ? '00' : llegadaM);
    return {
      ctx: 'Un autobús de la empresa TRACOPA salió de San José a las ' + fmtSalida + ' con destino a Ciudad Neily, Puntarenas. El viaje tardó ' + durHoras + ' horas y ' + durMins + ' minutos, llegando a las ' + fmtLlegada + '.',
      enunciado: 'Si el viaje de regreso sale de Ciudad Neily a las 2:00 p.m. y dura el mismo tiempo, ¿a qué hora llega a San José?',
      correcta: (14 + durHoras) % 24 + ':' + (durMins === 0 ? '00' : durMins),
      d: [(14 + durHoras + 1) % 24 + ':' + (durMins === 0 ? '00' : durMins), (14 + durHoras) % 24 + ':30', (13 + durHoras) % 24 + ':' + (durMins === 0 ? '00' : durMins)],
      pista: 'El regreso dura lo mismo: ' + durHoras + ' h y ' + durMins + ' min. Sumá eso a las 14:00 (2:00 p.m.).',
      pasos: [
        {titulo:'Identificar la duración', explicacion: 'El viaje dura ' + durHoras + ' horas y ' + durMins + ' minutos.'},
        {titulo:'Hora de salida del regreso', explicacion: 'Sale a las 14:00.'},
        {titulo:'Sumar la duración', explicacion: '14:00 + ' + durHoras + 'h = ' + (14 + durHoras) + ':00. Más ' + durMins + ' min = ' + (14 + durHoras) + ':' + (durMins === 0 ? '00' : durMins) + '.'},
        {titulo:'Verificar', explicacion: '14:00 + ' + durHoras + 'h ' + durMins + 'min = ' + (14 + durHoras) + ':' + (durMins === 0 ? '00' : durMins) + '. ✓'}
      ]
    };
  }
  if (tipo === 3) {
    var largo = rand(8, 30), ancho = rand(5, 20);
    var area = largo * ancho, precioM2 = rand(2, 8) * 1000;
    var costoTotal = area * precioM2, presupuesto = costoTotal + rand(1, 5) * 10000;
    var sobra = presupuesto - costoTotal;
    return {
      ctx: 'La municipalidad de Cartago quiere reforestar un terreno rectangular de ' + largo + ' m de largo y ' + ancho + ' m de ancho. Plantar árboles cuesta ₡' + precioM2.toLocaleString() + ' por m². El presupuesto disponible es ₡' + presupuesto.toLocaleString() + '.',
      enunciado: '¿Cuántos colones le sobrarán a la municipalidad después de reforestar todo el terreno?',
      correcta: '₡' + sobra.toLocaleString(),
      d: ['₡' + (sobra + precioM2).toLocaleString(), '₡' + costoTotal.toLocaleString(), '₡' + (sobra - 5000).toLocaleString()],
      pista: 'Calculá el área del terreno, multiplicá por el costo por m² y restá del presupuesto.',
      pasos: [
        {titulo:'Calcular el área', explicacion: largo + ' m × ' + ancho + ' m = ' + area + ' m².'},
        {titulo:'Calcular el costo total', explicacion: area + ' m² × ₡' + precioM2.toLocaleString() + ' = ₡' + costoTotal.toLocaleString() + '.'},
        {titulo:'Calcular lo que sobra', explicacion: '₡' + presupuesto.toLocaleString() + ' - ₡' + costoTotal.toLocaleString() + ' = ₡' + sobra.toLocaleString() + '.'},
        {titulo:'Verificar', explicacion: '₡' + costoTotal.toLocaleString() + ' + ₡' + sobra.toLocaleString() + ' = ₡' + presupuesto.toLocaleString() + '. ✓'}
      ]
    };
  }
  if (tipo === 4) {
    var inc = rand(4, 20), ini = rand(10, 50);
    var seq = [ini, ini+inc, ini+inc*2, ini+inc*3, ini+inc*4, ini+inc*5];
    var semanas = rand(3, 6);
    return {
      ctx: 'Un estudiante del SDBHS registra los árboles sembrados en el proyecto ambiental. Semana 1: ' + seq[0] + ' árboles. Semana 2: ' + seq[1] + '. Semana 3: ' + seq[2] + '. Semana 4: ' + seq[3] + '.',
      enunciado: 'Si el patrón continúa, ¿cuántos árboles habrán sembrado en la semana ' + (semanas + 2) + '?',
      correcta: seq[semanas + 1] + ' árboles',
      d: [(seq[semanas + 1] + inc) + ' árboles', (seq[semanas + 1] - 1) + ' árboles', seq[semanas] + ' árboles'],
      pista: '¿Cuánto aumenta la cantidad de árboles cada semana? Ese es el incremento constante.',
      pasos: [
        {titulo:'Identificar el patrón', explicacion: seq[1] + ' - ' + seq[0] + ' = ' + inc + '. Incremento constante: ' + inc + '.'},
        {titulo:'Extender la sucesión', explicacion: 'Sem 5: ' + seq[4] + '. Sem 6: ' + seq[5] + '.'},
        {titulo:'Responder', explicacion: 'Semana ' + (semanas + 2) + ': ' + seq[semanas + 1] + ' árboles.'},
        {titulo:'Verificar', explicacion: seq[semanas] + ' + ' + inc + ' = ' + seq[semanas + 1] + '. ✓'}
      ]
    };
  }
  if (tipo === 5) {
    var kg1 = rand(2, 8), g1 = rand(100, 900), kg2 = rand(1, 5), g2 = rand(100, 900);
    var total1G = kg1*1000+g1, total2G = kg2*1000+g2, totalG2 = total1G+total2G;
    var limiteG = rand(8, 14) * 1000, exceso = totalG2 > limiteG ? totalG2 - limiteG : 0;
    var cabe = totalG2 <= limiteG;
    return {
      ctx: 'En el aeropuerto Juan Santamaría, una familia lleva dos maletas. La primera pesa ' + kg1 + ' kg y ' + g1 + ' g. La segunda pesa ' + kg2 + ' kg y ' + g2 + ' g. La aerolínea permite máximo ' + (limiteG/1000) + ' kg en total.',
      enunciado: cabe ? '¿Cuántos gramos le quedan disponibles antes de alcanzar el límite?' : '¿Cuántos gramos excede el equipaje el límite permitido?',
      correcta: cabe ? (limiteG-totalG2)+' g' : exceso+' g',
      d: cabe ? [(limiteG-totalG2+100)+' g',(limiteG-totalG2-50)+' g',totalG2+' g'] : [(exceso+100)+' g',(exceso-50)+' g',totalG2+' g'],
      pista: 'Convertí ambas maletas a gramos, sumá los pesos y comparalos con el límite de ' + limiteG + ' g.',
      pasos: [
        {titulo:'Convertir maleta 1', explicacion: kg1+' × 1000 + '+g1+' = '+total1G+' g.'},
        {titulo:'Convertir maleta 2', explicacion: kg2+' × 1000 + '+g2+' = '+total2G+' g.'},
        {titulo:'Sumar y comparar', explicacion: total1G+' + '+total2G+' = '+totalG2+' g. Límite: '+limiteG+' g.'},
        {titulo:'Calcular diferencia', explicacion: cabe ? limiteG+' - '+totalG2+' = '+(limiteG-totalG2)+' g disponibles. ✓' : totalG2+' - '+limiteG+' = '+exceso+' g de exceso. ✓'}
      ]
    };
  }
  if (tipo === 6) {
    var dens = [3,4,5][rand(0,2)], num1 = rand(1, dens-1), tot = dens*rand(4,10);
    var parte1 = Math.round(tot*num1/dens), parte2 = tot-parte1;
    return {
      ctx: 'En la clase de 6° grado del SDBHS hay ' + tot + ' estudiantes. ' + num1 + '/' + dens + ' del grupo participó en el proyecto de Ciencias y el resto en el proyecto de Matemáticas.',
      enunciado: '¿Cuántos estudiantes más participaron en el proyecto de ' + (parte1>parte2?'Ciencias':'Matemáticas') + ' que en el otro proyecto?',
      correcta: Math.abs(parte1-parte2)+' estudiantes',
      d: [parte1+' estudiantes', parte2+' estudiantes', (Math.abs(parte1-parte2)+dens)+' estudiantes'],
      pista: 'Calculá cuántos son ' + num1 + '/' + dens + ' de ' + tot + '. Luego hallá el resto y comparalos.',
      pasos: [
        {titulo:'Calcular la fracción', explicacion: tot+' ÷ '+dens+' × '+num1+' = '+parte1+' estudiantes en Ciencias.'},
        {titulo:'Calcular el resto', explicacion: tot+' - '+parte1+' = '+parte2+' en Matemáticas.'},
        {titulo:'Encontrar la diferencia', explicacion: Math.max(parte1,parte2)+' - '+Math.min(parte1,parte2)+' = '+Math.abs(parte1-parte2)+'.'},
        {titulo:'Verificar', explicacion: parte1+' + '+parte2+' = '+tot+'. ✓'}
      ]
    };
  }
  var precioU = rand(200,800)*5, cantidad = rand(3,10);
  var total7 = precioU*cantidad, extra = rand(1,4)*1000, totalConExtra = total7+extra;
  return {
    ctx: 'Doña Carmen vende chorreadas en el mercado de Heredia. Vendió varias chorreadas a ₡' + precioU.toLocaleString() + ' cada una y cobró ₡' + extra.toLocaleString() + ' por el empaque. En total cobró ₡' + totalConExtra.toLocaleString() + '.',
    enunciado: '¿Cuántas chorreadas vendió doña Carmen?',
    correcta: cantidad+' chorreadas',
    d: [(cantidad+1)+' chorreadas',(cantidad-1)+' chorreadas',(cantidad+2)+' chorreadas'],
    pista: 'Quitá el costo del empaque del total. Lo que queda son las chorreadas. Dividí entre el precio unitario.',
    pasos: [
      {titulo:'Quitar el empaque', explicacion: '₡'+totalConExtra.toLocaleString()+' - ₡'+extra.toLocaleString()+' = ₡'+total7.toLocaleString()+'.'},
      {titulo:'Plantear la ecuación', explicacion: 'x × ₡'+precioU.toLocaleString()+' = ₡'+total7.toLocaleString()},
      {titulo:'Resolver', explicacion: '₡'+total7.toLocaleString()+' ÷ ₡'+precioU.toLocaleString()+' = '+cantidad+' chorreadas.'},
      {titulo:'Verificar', explicacion: cantidad+' × ₡'+precioU.toLocaleString()+' + ₡'+extra.toLocaleString()+' = ₡'+totalConExtra.toLocaleString()+'. ✓'}
    ]
  };
}

// ══════════════════════════════════════════════════════════════
//  PROMPTS
// ══════════════════════════════════════════════════════════════

const PROMPTS = {
  ss: function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada Diagnóstica de Estudios Sociales 2026, 6° grado primaria.\n\nBLOQUE: '+b+'\nAFIRMACIÓN: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO COSTARRICENSE REAL: el contexto_situacional debe presentar una situación, fuente histórica breve, dato geográfico o escenario ciudadano CONCRETO de Costa Rica directamente relacionado con la afirmación.\n2. COHERENCIA TOTAL: el contexto y la pregunta deben hablar del MISMO tema.\n3. ANÁLISIS E INFERENCIA: la pregunta debe pedir analizar, comparar, deducir consecuencias o inferir — NUNCA solo definiciones o fechas memorísticas.\n4. DISTRACTORES PLAUSIBLES: confusiones conceptuales reales de estudiantes costarricenses de 6° grado.\n5. VERIFICÁ que la clave sea históricamente correcta.\n\n'+JSON_SCHEMA; },
  esp: function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de comprensión lectora para la Prueba Nacional Estandarizada Diagnóstica de Español 2026, 6° grado primaria.\n\nAFIRMACIÓN: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. TEXTO ORIGINAL: el contexto_situacional DEBE ser un texto original de 5 a 7 oraciones, narrativo o informativo, con temática costarricense preferiblemente.\n2. COHERENCIA CON LA AFIRMACIÓN: si evalúa inferir pensamientos, el texto tiene personajes y la pregunta pide inferir. Si evalúa causa-efecto, el texto presenta una causa y la pregunta la identifica.\n3. IMPOSIBLE SIN LEER: la pregunta NO puede responderse sin leer el texto.\n4. DISTRACTORES: opciones plausibles que no se apoyen en el texto.\n5. PISTA: orientá a releer una parte específica sin revelar la respuesta.\n\n'+JSON_SCHEMA; },
  cien: function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada Diagnóstica de Ciencias 2026, 6° grado primaria.\n\nBLOQUE: '+b+'\nAFIRMACIÓN: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO CIENTÍFICO COSTARRICENSE: el contexto_situacional debe presentar una situación observable, dato científico o fenómeno natural DIRECTAMENTE relacionado con el concepto de la afirmación, contextualizado en Costa Rica cuando sea posible.\n2. COHERENCIA TOTAL: el contexto y la pregunta deben hablar del MISMO concepto científico.\n3. COMPRENSIÓN APLICADA: la pregunta pide aplicar o analizar el concepto — NO memorización de nombres.\n4. DISTRACTORES: errores conceptuales comunes en Ciencias de 6° grado costarricense.\n5. VERIFICÁ que la clave sea científicamente correcta.\n\n'+JSON_SCHEMA; },
  'sec-mat': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Matemáticas 2026, 11° año, colegios académicos diurnos y técnicos de Costa Rica.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO REAL: planteá el problema en un contexto cotidiano concreto de Costa Rica.\n2. DATOS CONCRETOS: incluí valores numéricos, tablas descritas o ecuaciones que el estudiante deba analizar o resolver.\n3. NIVEL 11°: el ítem debe requerir funciones, estadística, probabilidad o geometría analítica según el bloque.\n4. VERIFICACIÓN MATEMÁTICA CRÍTICA: (a) resolvé el problema PRIMERO, (b) escribí el resultado correcto en una opción, (c) asigná la clave a ESA opción. NUNCA pongas el resultado correcto en una opción y la clave en otra letra.\n5. DISTRACTORES TÍPICOS: errores algebraicos comunes en undécimo.\n6. La clave NO debe ser siempre A — variá la posición.\n7. En pasos_resolucion NUNCA menciones letras A, B, C o D — mencioná solo el valor correcto.\n\n'+JSON_SCHEMA; },
  'sec-esp': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de comprensión lectora para la Prueba Nacional Estandarizada SUMATIVA de Español 2026, 11° año, secundaria costarricense.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. TEXTO ORIGINAL: el contexto_situacional DEBE ser un texto original de 6 a 9 oraciones, literario o no literario, con temática costarricense o latinoamericana preferible.\n2. ALINEACIÓN A LA AFIRMACIÓN: si evalúa recursos retóricos, el texto incluye la figura entre [corchetes]. Si evalúa inferencia, requiere análisis profundo.\n3. PROFUNDIDAD COGNITIVA: la pregunta requiere el nivel cognitivo de la afirmación — nunca comprensión superficial.\n4. DISTRACTORES: lecturas superficiales, interpretaciones parciales.\n5. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; },
  'sec-cien': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Ciencias 2026 (Tabla 7: Física, Química y Biología), 11° año, colegios diurnos y técnicos de Costa Rica.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO SITUACIONAL CONCRETO: presentá una situación real, experimento o fenómeno natural costarricense relacionado con el concepto evaluado.\n2. ÁREA ESPECÍFICA: Física = datos numéricos y fórmulas verificadas. Química = sustancias reales relevantes para Costa Rica. Biología = ecosistemas o especies costarricenses.\n3. COMPRENSIÓN Y APLICACIÓN: la pregunta pide aplicar, analizar o resolver — nunca definir de memoria.\n4. EXACTITUD CIENTÍFICA CRÍTICA: (a) calculá el resultado PRIMERO, (b) escribí ese valor en una opción, (c) asigná la clave a ESA opción. NUNCA pongas el valor correcto en una opción y la clave en otra letra.\n5. DISTRACTORES: errores conceptuales típicos de undécimo.\n6. La clave NO debe ser siempre A — variá la posición.\n7. En pasos_resolucion NUNCA menciones letras A, B, C o D — mencioná solo el valor correcto.\n\n'+JSON_SCHEMA; },
  'sec-ss': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Estudios Sociales 2026, 11° año, secundaria costarricense.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO TEXTUAL CONCRETO: usá una fuente concreta — cita histórica, estadística, noticia o caso real relacionado con el bloque.\n2. ANÁLISIS E INFERENCIA: la pregunta pide analizar causas, consecuencias, comparar procesos o inferir implicaciones.\n3. PERTINENCIA COSTARRICENSE: para bloques sobre Costa Rica, relacioná con impacto en la vida cotidiana actual.\n4. DISTRACTORES PLAUSIBLES: respuestas históricamente posibles pero incorrectas para el contexto planteado.\n5. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; },
  'sec-civ': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Educación Cívica 2026, 11° año, secundaria costarricense.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CASO CIUDADANO CONCRETO: planteá un caso real o ficticio verosímil — dilema democrático, situación política o noticia sobre instituciones costarricenses.\n2. APLICACIÓN DEL CONOCIMIENTO CÍVICO: la pregunta pide analizar el caso y aplicar conocimiento — nunca solo definir términos.\n3. CONTEXTO COSTARRICENSE: privilegiá situaciones del sistema político, institucional y electoral de Costa Rica.\n4. DISTRACTORES: confusiones conceptuales comunes sobre el sistema político costarricense.\n5. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; },
  'mat-sum': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Matemáticas 2026, primaria costarricense.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO REAL COSTARRICENSE: planteá el problema en una situación cotidiana concreta de Costa Rica.\n2. DATOS CONCRETOS: incluí valores numéricos específicos que el estudiante deba analizar o calcular.\n3. RESOLUCIÓN EN PASOS: el problema debe requerir al menos dos pasos de razonamiento.\n4. VERIFICACIÓN MATEMÁTICA: comprobá que la respuesta correcta sea exacta antes de escribirla.\n5. DISTRACTORES: errores típicos de primaria.\n6. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; },
  'esp-sum': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de comprensión lectora para la Prueba Nacional Estandarizada SUMATIVA de Español 2026, primaria costarricense.\n\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. TEXTO ORIGINAL: el contexto_situacional DEBE ser un texto original de 5 a 7 oraciones con temática costarricense preferiblemente.\n2. ALINEACIÓN EXACTA A LA AFIRMACIÓN: si evalúa ideas fundamentales, la pregunta pide la idea central. Si evalúa causa-efecto, pide la causa o efecto. Si evalúa pensamientos, pide inferir qué piensa el personaje. Si evalúa conflictos, pide el problema central. Si evalúa comportamientos, pide por qué actúa el personaje.\n3. IMPOSIBLE SIN LEER: la respuesta NO puede deducirse sin leer el texto.\n4. DISTRACTORES: confusión entre idea central y detalle, causa con efecto, inferencia incorrecta.\n5. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; },
  'cien-sum': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Ciencias 2026, primaria costarricense.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO CIENTÍFICO COSTARRICENSE: el contexto_situacional debe presentar una situación, dato científico o fenómeno DIRECTAMENTE relacionado con el concepto, contextualizado en Costa Rica.\n2. COHERENCIA TOTAL: el contexto y la pregunta deben referirse al MISMO concepto científico del bloque.\n3. COMPRENSIÓN APLICADA: la pregunta pide aplicar o analizar el concepto — no memorización.\n4. EXACTITUD CIENTÍFICA: verificá que la clave sea científicamente correcta.\n5. DISTRACTORES: errores conceptuales comunes en Ciencias de primaria costarricense.\n6. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; },
  'ss-sum': function(b,a){ return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada SUMATIVA de Estudios Sociales 2026, primaria costarricense.\n\nBLOQUE: '+b+'\nAFIRMACIÓN/EVIDENCIA: '+a+'\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO COSTARRICENSE CONCRETO: el contexto_situacional debe presentar una situación, fuente histórica breve, dato geográfico o escenario ciudadano CONCRETO de Costa Rica directamente relacionado con la afirmación.\n2. COHERENCIA TOTAL: el contexto y la pregunta deben hablar del MISMO tema.\n3. ANÁLISIS E INFERENCIA: la pregunta pide analizar, comparar, inferir consecuencias o distinguir efectos — NUNCA solo recordar fechas o nombres.\n4. DISTRACTORES PLAUSIBLES: confusiones históricas o geográficas comunes de estudiantes de primaria costarricense.\n5. VERIFICÁ que la clave sea históricamente correcta.\n6. La clave NO debe ser siempre A — variá la posición.\n\n'+JSON_SCHEMA; }
};

// ══════════════════════════════════════════════════════════════
//  HANDLER PRINCIPAL
// ══════════════════════════════════════════════════════════════

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const materia    = req.body && req.body.materia    ? req.body.materia    : 'mat';
  const bloque     = req.body && req.body.bloque     ? req.body.bloque     : '';
  const afirmacion = req.body && req.body.afirmacion ? req.body.afirmacion : '';

  try {
    if (materia === 'mat') {
      const ej = crearEjercicioMat();
      const rawOps = { A: ej.correcta, B: ej.d[0], C: ej.d[1], D: ej.d[2] };
      const mixed = mezclar(garantizarUnicas(rawOps), 'A');
      return res.status(200).json({
        contexto_situacional: ej.ctx, enunciado: ej.enunciado,
        opciones: mixed.opciones, clave: mixed.clave,
        pista: ej.pista, pasos_resolucion: ej.pasos
      });
    }

    const promptFn = PROMPTS[materia];
    if (!promptFn) return res.status(400).json({ error: 'Materia no reconocida: ' + materia });

    // Recoger todas las keys disponibles
    const keys = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4
    ].filter(Boolean);
    if (keys.length === 0) return res.status(500).json({ error: 'GROQ_API_KEY no configurada' });

    // Mezclar el orden de las keys para distribuir la carga
    for (var i = keys.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = keys[i]; keys[i] = keys[j]; keys[j] = tmp;
    }

    const ejercicio = await llamarGroq(keys, promptFn(bloque, afirmacion));
    const mixed = mezclar(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = mixed.opciones;
    ejercicio.clave = mixed.clave;
    return res.status(200).json(ejercicio);

  } catch (err) {
    console.error('[/api/generar] materia=' + materia + ':', err.message);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};
