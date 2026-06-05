// TutoríaPRO — Vercel Serverless Function
// 4 materias: mat, esp, cien, ss

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

function crearEjercicioMat() {
  var tipo = rand(0, 7);

  // TIPO 0: División con análisis — ¿cuántas cajas completas Y cuánto sobra?
  if (tipo === 0) {
    var total = rand(150, 600), div = rand(8, 25);
    var cociente = Math.floor(total / div), resto = total % div;
    var necesita = cociente + 1;
    // Pregunta inversa: ¿cuánto falta para llenar una caja más?
    var falta = div - resto;
    var d1 = falta + div, d2 = resto, d3 = div - resto + 1;
    // Garantizar únicos
    if (d1 === falta) d1 = falta + div + 1;
    if (d2 === falta) d2 = resto + 1;
    if (d3 === falta) d3 = falta + 2;
    return {
      ctx: 'La cooperativa de productores de piña de Puntarenas cosechó ' + total + ' piñas. Las cajas de exportación tienen capacidad para ' + div + ' piñas cada una. Las cajas incompletas no se pueden exportar.',
      enunciado: '¿Cuántas piñas le faltaron a la cooperativa para poder llenar una caja más y aumentar en uno el total de cajas exportadas?',
      correcta: falta + ' piñas',
      d: [d1 + ' piñas', d2 + ' piñas', d3 + ' piñas'],
      pista: 'Primero calculá cuántas cajas completas se llenaron y cuántas piñas sobraron. Luego pensá: ¿cuántas faltarían para completar la siguiente caja?',
      pasos: [
        {titulo:'Dividir para encontrar cajas y sobrante', explicacion: total + ' ÷ ' + div + ' = ' + cociente + ' cajas completas, con ' + resto + ' piñas sobrantes.'},
        {titulo:'Analizar la caja incompleta', explicacion: 'La caja siguiente necesita ' + div + ' piñas pero solo hay ' + resto + '. Le faltan ' + div + ' - ' + resto + ' = ' + falta + ' piñas.'},
        {titulo:'Resolver', explicacion: 'Faltan ' + falta + ' piñas para completar la caja número ' + necesita + '.'},
        {titulo:'Verificar', explicacion: resto + ' + ' + falta + ' = ' + div + ', que es exactamente la capacidad de una caja. ✓'}
      ]
    };
  }

  // TIPO 1: Porcentaje con decisión — comparar dos opciones
  if (tipo === 1) {
    var pct = [20, 25, 30][rand(0, 2)];
    var precioBase = rand(3, 12) * 1000;
    var descuento = Math.round(precioBase * pct / 100);
    var precioDes = precioBase - descuento;
    var precioOtro = precioDes + rand(500, 2000);
    return {
      ctx: 'En la Feria del Agricultor de San José, un puesto vende aguacates a ₡' + precioBase.toLocaleString() + ' el kilo y ofrece un descuento del ' + pct + '% por compras mayores a 2 kilos. En el puesto vecino, el mismo aguacate cuesta ₡' + precioOtro.toLocaleString() + ' sin descuento.',
      enunciado: '¿Cuántos colones ahorra un comprador que adquiere 1 kilo con el descuento del ' + pct + '% en lugar de comprarlo sin descuento en el puesto vecino?',
      correcta: '₡' + (precioOtro - precioDes).toLocaleString(),
      d: ['₡' + descuento.toLocaleString(), '₡' + (precioOtro - precioBase).toLocaleString(), '₡' + (precioDes).toLocaleString()],
      pista: 'Primero calculá el precio con descuento: ₡' + precioBase.toLocaleString() + ' - ' + pct + '% = ¿cuánto? Luego comparalo con ₡' + precioOtro.toLocaleString() + '.',
      pasos: [
        {titulo:'Calcular el descuento', explicacion: pct + '% de ₡' + precioBase.toLocaleString() + ' = ₡' + descuento.toLocaleString() + '.'},
        {titulo:'Precio con descuento', explicacion: '₡' + precioBase.toLocaleString() + ' - ₡' + descuento.toLocaleString() + ' = ₡' + precioDes.toLocaleString() + '.'},
        {titulo:'Comparar con el otro puesto', explicacion: '₡' + precioOtro.toLocaleString() + ' - ₡' + precioDes.toLocaleString() + ' = ₡' + (precioOtro - precioDes).toLocaleString() + ' de ahorro.'},
        {titulo:'Verificar', explicacion: 'El puesto con descuento cuesta ₡' + precioDes.toLocaleString() + ' vs ₡' + precioOtro.toLocaleString() + '. Diferencia: ₡' + (precioOtro - precioDes).toLocaleString() + '. ✓'}
      ]
    };
  }

  // TIPO 2: Tiempo — problema inverso con análisis
  if (tipo === 2) {
    var horasSalida = rand(5, 9), minsSalida = [0, 15, 30, 45][rand(0, 3)];
    var durHoras = rand(2, 5), durMins = [0, 20, 30, 40][rand(0, 3)];
    var llegadaMins = horasSalida * 60 + minsSalida + durHoras * 60 + durMins;
    var llegadaH = Math.floor(llegadaMins / 60) % 24;
    var llegadaM = llegadaMins % 60;
    var fmtSalida = horasSalida + ':' + (minsSalida === 0 ? '00' : minsSalida);
    var fmtLlegada = llegadaH + ':' + (llegadaM === 0 ? '00' : llegadaM);
    var totalMin = durHoras * 60 + durMins;
    var d1 = totalMin + 15, d2 = durHoras * 60, d3 = totalMin - 10;
    if (d3 <= 0) d3 = totalMin + 5;
    return {
      ctx: 'Un autobús de la empresa TRACOPA salió de San José a las ' + fmtSalida + ' con destino a Ciudad Neily, Puntarenas. Por el estado de la carretera, el viaje tardó ' + durHoras + ' horas y ' + durMins + ' minutos, llegando a las ' + fmtLlegada + '.',
      enunciado: 'Si el viaje de regreso sale de Ciudad Neily a las 2:00 p.m. y dura el mismo tiempo, ¿a qué hora llega a San José?',
      correcta: (14 + durHoras) % 24 + ':' + (durMins === 0 ? '00' : durMins),
      d: [(14 + durHoras + 1) % 24 + ':' + (durMins === 0 ? '00' : durMins), (14 + durHoras) % 24 + ':30', (13 + durHoras) % 24 + ':' + (durMins === 0 ? '00' : durMins)],
      pista: 'El viaje de regreso dura lo mismo: ' + durHoras + ' h y ' + durMins + ' min. Sumá eso a las 2:00 p.m. (14:00 horas).',
      pasos: [
        {titulo:'Identificar la duración', explicacion: 'El viaje dura ' + durHoras + ' horas y ' + durMins + ' minutos en ambas direcciones.'},
        {titulo:'Hora de salida del regreso', explicacion: 'Sale a las 14:00 (2:00 p.m.).'},
        {titulo:'Sumar la duración', explicacion: '14:00 + ' + durHoras + ' horas = ' + (14 + durHoras) + ':00. Más ' + durMins + ' minutos = ' + (14 + durHoras) + ':' + (durMins === 0 ? '00' : durMins) + '.'},
        {titulo:'Verificar', explicacion: 'Salida 14:00 + ' + durHoras + 'h ' + durMins + 'min = ' + (14 + durHoras) + ':' + (durMins === 0 ? '00' : durMins) + '. ✓'}
      ]
    };
  }

  // TIPO 3: Geometría — área con problema real de dos pasos
  if (tipo === 3) {
    var largo = rand(8, 30), ancho = rand(5, 20);
    var area = largo * ancho;
    var precioM2 = rand(2, 8) * 1000;
    var costoTotal = area * precioM2;
    var presupuesto = costoTotal + rand(1, 5) * 10000;
    var sobra = presupuesto - costoTotal;
    return {
      ctx: 'La municipalidad de Cartago quiere reforestar un terreno rectangular de ' + largo + ' m de largo y ' + ancho + ' m de ancho. El costo de plantar árboles es de ₡' + precioM2.toLocaleString() + ' por metro cuadrado. La municipalidad tiene un presupuesto de ₡' + presupuesto.toLocaleString() + '.',
      enunciado: '¿Cuántos colones le sobrarán a la municipalidad después de reforestar todo el terreno?',
      correcta: '₡' + sobra.toLocaleString(),
      d: ['₡' + (sobra + precioM2).toLocaleString(), '₡' + costoTotal.toLocaleString(), '₡' + (sobra - 5000).toLocaleString()],
      pista: 'Primero calculá el área del terreno. Luego multiplicá por el costo por m². Finalmente restá del presupuesto.',
      pasos: [
        {titulo:'Calcular el área', explicacion: largo + ' m × ' + ancho + ' m = ' + area + ' m².'},
        {titulo:'Calcular el costo total', explicacion: area + ' m² × ₡' + precioM2.toLocaleString() + ' = ₡' + costoTotal.toLocaleString() + '.'},
        {titulo:'Calcular lo que sobra', explicacion: '₡' + presupuesto.toLocaleString() + ' - ₡' + costoTotal.toLocaleString() + ' = ₡' + sobra.toLocaleString() + '.'},
        {titulo:'Verificar', explicacion: '₡' + costoTotal.toLocaleString() + ' + ₡' + sobra.toLocaleString() + ' = ₡' + presupuesto.toLocaleString() + '. ✓'}
      ]
    };
  }

  // TIPO 4: Patrón numérico con contexto de crecimiento real
  if (tipo === 4) {
    var inc = rand(4, 20), ini = rand(10, 50);
    var seq = [ini, ini+inc, ini+inc*2, ini+inc*3, ini+inc*4, ini+inc*5];
    var semanas = rand(3, 6);
    var enSemana = seq[semanas - 1];
    return {
      ctx: 'Un estudiante del SDBHS lleva un registro de la cantidad de árboles sembrados en el proyecto ambiental del colegio. En la primera semana sembraron ' + seq[0] + ' árboles, en la segunda ' + seq[1] + ', en la tercera ' + seq[2] + ' y en la cuarta ' + seq[3] + '.',
      enunciado: 'Si el patrón continúa, ¿cuántos árboles habrán sembrado en la semana ' + (semanas + 2) + '?',
      correcta: seq[semanas + 1] + ' árboles',
      d: [(seq[semanas + 1] + inc) + ' árboles', (seq[semanas + 1] - 1) + ' árboles', seq[semanas] + ' árboles'],
      pista: 'Identificá cuánto aumenta la cantidad de árboles cada semana. Ese es el incremento constante del patrón.',
      pasos: [
        {titulo:'Identificar el patrón', explicacion: seq[1] + ' - ' + seq[0] + ' = ' + inc + '. El patrón aumenta ' + inc + ' árboles por semana.'},
        {titulo:'Extender la sucesión', explicacion: 'Semana 5: ' + seq[4] + '. Semana 6: ' + seq[5] + '. Semana 7: ' + (seq[5]+inc) + '.'},
        {titulo:'Responder', explicacion: 'En la semana ' + (semanas + 2) + ' habrá ' + seq[semanas + 1] + ' árboles.'},
        {titulo:'Verificar', explicacion: seq[semanas] + ' + ' + inc + ' = ' + seq[semanas + 1] + '. ✓'}
      ]
    };
  }

  // TIPO 5: Medidas con conversión + decisión
  if (tipo === 5) {
    var kg1 = rand(2, 8), g1 = rand(100, 900);
    var kg2 = rand(1, 5), g2 = rand(100, 900);
    var total1G = kg1 * 1000 + g1;
    var total2G = kg2 * 1000 + g2;
    var totalG2 = total1G + total2G;
    var limiteG = rand(8, 14) * 1000;
    var exceso = totalG2 > limiteG ? totalG2 - limiteG : 0;
    var cabe = totalG2 <= limiteG;
    return {
      ctx: 'En el aeropuerto Juan Santamaría, una familia costarricense lleva dos maletas. La primera pesa ' + kg1 + ' kg y ' + g1 + ' g. La segunda pesa ' + kg2 + ' kg y ' + g2 + ' g. La aerolínea permite un máximo de ' + (limiteG / 1000) + ' kg en total.',
      enunciado: cabe
        ? '¿Cuántos gramos le quedan disponibles a la familia antes de alcanzar el límite permitido?'
        : '¿Cuántos gramos excede el equipaje el límite permitido?',
      correcta: cabe ? (limiteG - totalG2) + ' g' : exceso + ' g',
      d: cabe
        ? [(limiteG - totalG2 + 100) + ' g', (limiteG - totalG2 - 50) + ' g', total2G + ' g']
        : [(exceso + 100) + ' g', (exceso - 50) + ' g', total2G + ' g'],
      pista: 'Primero convertí ambas maletas a gramos. Luego sumá los pesos y comparalos con el límite de ' + limiteG + ' g.',
      pasos: [
        {titulo:'Convertir maleta 1', explicacion: kg1 + ' kg × 1000 + ' + g1 + ' g = ' + total1G + ' g.'},
        {titulo:'Convertir maleta 2', explicacion: kg2 + ' kg × 1000 + ' + g2 + ' g = ' + total2G + ' g.'},
        {titulo:'Sumar y comparar', explicacion: total1G + ' + ' + total2G + ' = ' + totalG2 + ' g. Límite: ' + limiteG + ' g.'},
        {titulo:'Calcular diferencia', explicacion: cabe ? limiteG + ' - ' + totalG2 + ' = ' + (limiteG - totalG2) + ' g disponibles. ✓' : totalG2 + ' - ' + limiteG + ' = ' + exceso + ' g de exceso. ✓'}
      ]
    };
  }

  // TIPO 6: Fracciones con análisis de reparto
  if (tipo === 6) {
    var dens = [3, 4, 5][rand(0, 2)];
    var num1 = rand(1, dens - 1);
    var num2 = dens - num1;
    var tot = dens * rand(4, 10);
    var parte1 = Math.round(tot * num1 / dens);
    var parte2 = tot - parte1;
    return {
      ctx: 'En la clase de 6° grado del SDBHS hay ' + tot + ' estudiantes. ' + num1 + '/' + dens + ' del grupo participó en el proyecto de Ciencias y el resto participó en el proyecto de Matemáticas.',
      enunciado: '¿Cuántos estudiantes más participaron en el proyecto de ' + (parte1 > parte2 ? 'Ciencias' : 'Matemáticas') + ' que en el otro proyecto?',
      correcta: Math.abs(parte1 - parte2) + ' estudiantes',
      d: [parte1 + ' estudiantes', parte2 + ' estudiantes', (Math.abs(parte1 - parte2) + dens) + ' estudiantes'],
      pista: 'Primero calculá cuántos estudiantes representan ' + num1 + '/' + dens + ' de ' + tot + '. Luego calculá los del otro proyecto y comparalos.',
      pasos: [
        {titulo:'Calcular la fracción', explicacion: tot + ' ÷ ' + dens + ' × ' + num1 + ' = ' + parte1 + ' estudiantes en Ciencias.'},
        {titulo:'Calcular el resto', explicacion: tot + ' - ' + parte1 + ' = ' + parte2 + ' estudiantes en Matemáticas.'},
        {titulo:'Encontrar la diferencia', explicacion: Math.max(parte1, parte2) + ' - ' + Math.min(parte1, parte2) + ' = ' + Math.abs(parte1 - parte2) + ' estudiantes de diferencia.'},
        {titulo:'Verificar', explicacion: parte1 + ' + ' + parte2 + ' = ' + tot + ' estudiantes en total. ✓'}
      ]
    };
  }

  // TIPO 7: Ecuación con incógnita en contexto real
  var precioU = rand(200, 800) * 5;
  var cantidad = rand(3, 10);
  var total7 = precioU * cantidad;
  var extra = rand(1, 4) * 1000;
  var totalConExtra = total7 + extra;
  return {
    ctx: 'Doña Carmen vende chorreadas en el mercado de Heredia. Vendió varias chorreadas a ₡' + precioU.toLocaleString() + ' cada una y además cobró ₡' + extra.toLocaleString() + ' por el empaque. En total cobró ₡' + totalConExtra.toLocaleString() + '.',
    enunciado: '¿Cuántas chorreadas vendió doña Carmen?',
    correcta: cantidad + ' chorreadas',
    d: [(cantidad + 1) + ' chorreadas', (cantidad - 1) + ' chorreadas', (cantidad + 2) + ' chorreadas'],
    pista: 'Quitá primero el costo del empaque del total. Lo que queda es el precio de las chorreadas. Dividí entre el precio unitario.',
    pasos: [
      {titulo:'Quitar el empaque', explicacion: '₡' + totalConExtra.toLocaleString() + ' - ₡' + extra.toLocaleString() + ' = ₡' + total7.toLocaleString() + ' por las chorreadas.'},
      {titulo:'Plantear la ecuación', explicacion: 'x × ₡' + precioU.toLocaleString() + ' = ₡' + total7.toLocaleString()},
      {titulo:'Resolver', explicacion: '₡' + total7.toLocaleString() + ' ÷ ₡' + precioU.toLocaleString() + ' = ' + cantidad + ' chorreadas.'},
      {titulo:'Verificar', explicacion: cantidad + ' × ₡' + precioU.toLocaleString() + ' + ₡' + extra.toLocaleString() + ' = ₡' + totalConExtra.toLocaleString() + '. ✓'}
    ]
  };
}


const PROMPTS = {

  ss: function(b, a) {
    return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada Diagnóstica de Estudios Sociales 2026, 6° grado primaria.\n\nBLOQUE: ' + b + '\nAFIRMACIÓN: ' + a + '\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO COSTARRICENSE REAL: El contexto_situacional debe presentar una situación, fuente histórica breve, dato geográfico o escenario ciudadano CONCRETO de Costa Rica directamente relacionado con la afirmación. Ejemplos: una descripción del relieve de una región específica, un fragmento sobre un evento histórico costarricense, una situación de participación ciudadana en una comunidad tica.\n2. COHERENCIA TOTAL: el contexto y la pregunta deben hablar del MISMO tema. Si la afirmación es sobre la Campaña Nacional 1856, el contexto describe ese evento y la pregunta analiza ese evento.\n3. ANÁLISIS E INFERENCIA: la pregunta debe pedir al estudiante que analice, compare, deduzca consecuencias o infiera a partir del contexto — NUNCA preguntar solo por definiciones o fechas memorísticas.\n4. DISTRACTORES PLAUSIBLES: los tres incorrectos deben representar confusiones conceptuales reales de estudiantes costarricenses de 6° grado, no respuestas absurdas.\n5. VERIFICÁ que la clave sea históricamente y conceptualmente correcta.\n\nRespondé SOLO con JSON sin backticks:\n{"contexto_situacional":"situación concreta costarricense relacionada con el tema (2-4 oraciones)","enunciado":"pregunta de análisis, comparación o inferencia","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"A","pista":"orientación para analizar el contexto sin revelar la respuesta","pasos_resolucion":[{"titulo":"Identificar el tema","explicacion":"..."},{"titulo":"Analizar el contexto","explicacion":"..."},{"titulo":"Determinar la respuesta","explicacion":"..."},{"titulo":"Verificar","explicacion":"..."}]}';
  },

  esp: function(b, a) {
    return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de comprensión lectora para la Prueba Nacional Estandarizada Sumativa de Español 2026, 6° grado primaria.\n\nAFIRMACIÓN: ' + a + '\n\nREGLAS OBLIGATORIAS:\n1. TEXTO ORIGINAL: El contexto_situacional DEBE ser un texto original de 5 a 7 oraciones. Puede ser narrativo (cuento, anécdota, diálogo) o informativo (noticia breve, artículo), con temática costarricense preferiblemente (naturaleza, cultura, personajes, lugares de Costa Rica).\n2. COHERENCIA CON LA AFIRMACIÓN: si la afirmación evalúa inferir pensamientos de personajes, el texto debe tener personajes y la pregunta debe pedir inferir sus pensamientos. Si evalúa causa-efecto, el texto debe presentar una causa y la pregunta pide identificarla. Si evalúa idea principal, la pregunta pide la idea central del texto.\n3. IMPOSIBLE SIN LEER: la pregunta NO puede responderse sin leer el texto — debe requerir comprensión profunda.\n4. DISTRACTORES: tres opciones que parezcan plausibles pero no se apoyen en el texto. Representan errores de comprensión típicos: confundir información literal con inferencia, elegir detalles irrelevantes, confundir causa con efecto.\n5. PISTA: debe orientar al estudiante a releer una parte específica del texto sin revelar la respuesta.\n\nRespondé SOLO con JSON sin backticks:\n{"contexto_situacional":"texto original de 5-7 oraciones con temática costarricense","enunciado":"pregunta de comprensión profunda directamente basada en el texto","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"A","pista":"señalá qué parte del texto releer sin dar la respuesta","pasos_resolucion":[{"titulo":"Leer el texto con atención","explicacion":"..."},{"titulo":"Identificar qué pregunta la afirmación","explicacion":"..."},{"titulo":"Analizar las opciones con el texto","explicacion":"..."},{"titulo":"Verificar que la respuesta se apoya en el texto","explicacion":"..."}]}';
  },

  cien: function(b, a) {
    return 'Eres un evaluador experto del MEP de Costa Rica. Generá un ítem de selección única para la Prueba Nacional Estandarizada Sumativa de Ciencias 2026, 6° grado primaria.\n\nBLOQUE: ' + b + '\nAFIRMACIÓN: ' + a + '\n\nREGLAS OBLIGATORIAS:\n1. CONTEXTO CIENTÍFICO COSTARRICENSE: el contexto_situacional debe presentar una situación observable, un dato científico, un experimento simple o un fenómeno natural DIRECTAMENTE relacionado con el concepto de la afirmación, contextualizado en Costa Rica cuando sea posible (volcanes, biodiversidad, ecosistemas, cuerpo humano en situaciones cotidianas ticas).\n2. COHERENCIA TOTAL: el contexto y la pregunta deben hablar del MISMO concepto científico. Si la afirmación trata del sistema circulatorio, el contexto describe una situación del sistema circulatorio (no de biodiversidad). Si trata de fotosíntesis, el contexto muestra datos de fotosíntesis.\n3. COMPRENSIÓN APLICADA: la pregunta debe pedir al estudiante que aplique o analice el concepto a partir del contexto — NO preguntas de memorización de nombres o definiciones aisladas.\n4. DISTRACTORES: los tres incorrectos representan errores conceptuales comunes en Ciencias de 6° grado costarricense.\n5. VERIFICÁ que la clave sea científicamente correcta.\n\nRespondé SOLO con JSON sin backticks:\n{"contexto_situacional":"situación científica concreta relacionada con el concepto evaluado (2-3 oraciones), con contexto costarricense cuando sea natural","enunciado":"pregunta de comprensión o aplicación del concepto científico","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"A","pista":"orientación conceptual sin revelar la respuesta","pasos_resolucion":[{"titulo":"Comprender la situación","explicacion":"..."},{"titulo":"Identificar el concepto científico clave","explicacion":"..."},{"titulo":"Analizar las opciones","explicacion":"..."},{"titulo":"Verificar la respuesta","explicacion":"..."}]}';
  }

};


function garantizarUnicas(opciones, clave) {
  var letras = ['A','B','C','D'];
  var vistos = {};
  var resultado = {};
  letras.forEach(function(l) {
    var val = opciones[l];
    var intento = 0;
    while (vistos[val] !== undefined && intento < 10) {
      var num = parseFloat(val);
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const materia   = req.body && req.body.materia   ? req.body.materia   : 'mat';
  const bloque    = req.body && req.body.bloque     ? req.body.bloque    : '';
  const afirmacion = req.body && req.body.afirmacion ? req.body.afirmacion : '';

  try {
    if (materia === 'mat') {
      const ej = crearEjercicioMat();
      const rawOps = { A: ej.correcta, B: ej.d[0], C: ej.d[1], D: ej.d[2] };
      const uniqueOps = garantizarUnicas(rawOps, 'A');
      const mixed = mezclar(uniqueOps, 'A');
      return res.status(200).json({
        contexto_situacional: ej.ctx,
        enunciado: ej.enunciado,
        opciones: mixed.opciones,
        clave: mixed.clave,
        pista: ej.pista,
        pasos_resolucion: ej.pasos
      });
    }

    const promptFn = PROMPTS[materia];
    if (!promptFn) {
      return res.status(400).json({ error: 'Materia no reconocida: ' + materia });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY no configurada' });
    }

    const prompt = promptFn(bloque, afirmacion);

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const datos = await groqRes.json();

    if (datos.error) {
      return res.status(500).json({ error: datos.error.message });
    }

    const texto = datos.choices && datos.choices[0] && datos.choices[0].message
      ? datos.choices[0].message.content || ''
      : '';

    const ini = texto.indexOf('{');
    const fin = texto.lastIndexOf('}');
    if (ini === -1 || fin === -1) {
      return res.status(500).json({ error: 'Sin JSON válido en respuesta' });
    }

    const ejercicio = JSON.parse(texto.substring(ini, fin + 1));
    if (!ejercicio.enunciado || !ejercicio.opciones || !ejercicio.clave) {
      return res.status(500).json({ error: 'JSON incompleto' });
    }

    const mixed = mezclar(ejercicio.opciones, ejercicio.clave);
    ejercicio.opciones = mixed.opciones;
    ejercicio.clave    = mixed.clave;

    return res.status(200).json(ejercicio);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};
