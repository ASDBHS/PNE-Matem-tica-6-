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
  const tipo = rand(0, 6);
  if (tipo === 0) {
    const total = rand(200, 999), div = rand(6, 20);
    const cociente = Math.floor(total / div), resto = total % div;
    const d1d = cociente + 1;
    const d2d = cociente - 1 > 0 ? cociente - 1 : cociente + 2;
    const d3d = Math.floor(total/(div+3)) !== cociente && Math.floor(total/(div+3)) !== d1d && Math.floor(total/(div+3)) !== d2d ? Math.floor(total/(div+3)) : cociente + 3;
    return { ctx: 'En la Feria del Agricultor de Alajuela, don Marco tiene ' + total + ' naranjas que quiere empacar en bolsas de ' + div + ' unidades cada una.', enunciado: '¿Cuántas bolsas completas puede llenar don Marco?', correcta: cociente + ' bolsas', d: [d1d + ' bolsas', d2d + ' bolsas', d3d + ' bolsas'], pista: 'Dividí ' + total + ' entre ' + div + '. El resultado entero es la cantidad de bolsas completas.', pasos: [{titulo:'Comprender',explicacion:'Tenemos ' + total + ' naranjas y bolsas de ' + div + '.'},{titulo:'Plantear',explicacion:total + ' ÷ ' + div},{titulo:'Resolver',explicacion:total + ' ÷ ' + div + ' = ' + cociente + ' con resto ' + resto + '.'},{titulo:'Verificar',explicacion:cociente + ' × ' + div + ' = ' + (cociente*div) + ' + ' + resto + ' = ' + total + '. ✓'}] };
  }
  if (tipo === 1) {
    const pct = [10,20,25,50][rand(0,3)];
    const total = pct===25 ? rand(4,20)*4 : pct===50 ? rand(4,20)*2 : rand(5,30)*10;
    const res = (total * pct) / 100;
    const d1 = res + pct;
    const d2 = total - res !== res ? total - res : total - res + 1;
    const d3 = res + 10 !== res && res + 10 !== d1 && res + 10 !== d2 ? res + 10 : res + 15;
    return { ctx: 'En la soda escolar del SDBHS se vendieron ' + total + ' refrescos durante la semana.', enunciado: 'Si el ' + pct + '% de los refrescos vendidos eran de cas, ¿cuántos refrescos de cas se vendieron?', correcta: res + ' refrescos', d: [d1 + ' refrescos', d2 + ' refrescos', d3 + ' refrescos'], pista: 'Para calcular el ' + pct + '% de ' + total + ': multiplicá ' + total + ' × ' + pct + ' y dividí entre 100.', pasos: [{titulo:'Comprender',explicacion:'Queremos el ' + pct + '% de ' + total + ' refrescos.'},{titulo:'Plantear',explicacion:total + ' × ' + pct + ' ÷ 100'},{titulo:'Resolver',explicacion:(total*pct) + ' ÷ 100 = ' + res + '.'},{titulo:'Verificar',explicacion:res + ' es el ' + pct + '% de ' + total + '. ✓'}] };
  }
  if (tipo === 2) {
    const horas = rand(1,8), mins = rand(5,55), totalMin = horas*60+mins;
    return { ctx: 'El viaje en autobús desde San José hasta Liberia dura ' + horas + ' horas y ' + mins + ' minutos.', enunciado: '¿Cuántos minutos dura el viaje en total?', correcta: totalMin + ' minutos', d: [(horas*60) + ' minutos', (totalMin+10) + ' minutos', (totalMin-5) + ' minutos'], pista: '1 hora = 60 minutos. Convertí las horas y sumá los minutos.', pasos: [{titulo:'Comprender',explicacion:horas + ' horas y ' + mins + ' minutos.'},{titulo:'Plantear',explicacion:horas + ' × 60 + ' + mins},{titulo:'Resolver',explicacion:(horas*60) + ' + ' + mins + ' = ' + totalMin + ' minutos.'},{titulo:'Verificar',explicacion:(horas*60) + ' + ' + mins + ' = ' + totalMin + '. ✓'}] };
  }
  if (tipo === 3) {
    const base = rand(4,25), altura = rand(3,15), area = base*altura, perim = 2*(base+altura);
    return { ctx: 'Una familia de Cartago tiene un jardín rectangular que mide ' + base + ' metros de largo y ' + altura + ' metros de ancho.', enunciado: '¿Cuál es el área del jardín?', correcta: area + ' m²', d: [perim + ' m²', (area+base) + ' m²', (area-altura) + ' m²'], pista: 'Área = base × altura = ' + base + ' × ' + altura + '.', pasos: [{titulo:'Comprender',explicacion:'Jardín de ' + base + ' m × ' + altura + ' m.'},{titulo:'Plantear',explicacion:'Área = ' + base + ' × ' + altura},{titulo:'Resolver',explicacion:base + ' × ' + altura + ' = ' + area + ' m²'},{titulo:'Verificar',explicacion:area + ' ÷ ' + base + ' = ' + altura + '. ✓'}] };
  }
  if (tipo === 4) {
    const inc = rand(3,15), ini = rand(2,20);
    const seq = [ini, ini+inc, ini+inc*2, ini+inc*3, ini+inc*4];
    return { ctx: 'La profesora Patricia propone encontrar el patrón de la siguiente sucesión numérica.', enunciado: '¿Cuál es el número que sigue? ' + seq[0] + ', ' + seq[1] + ', ' + seq[2] + ', ' + seq[3] + ', ___', correcta: '' + seq[4], d: ['' + (seq[4]+inc), '' + (seq[4]-1), '' + (seq[3]+inc-1)], pista: 'Calculá la diferencia entre cada par de números. ¿Es siempre la misma?', pasos: [{titulo:'Comprender',explicacion:'Sucesión: ' + seq.slice(0,4).join(', ') + '.'},{titulo:'Identificar patrón',explicacion:'Diferencia constante: ' + inc + '.'},{titulo:'Resolver',explicacion:seq[3] + ' + ' + inc + ' = ' + seq[4] + '.'},{titulo:'Verificar',explicacion:'Sucesión: ' + seq.join(', ') + '. ✓'}] };
  }
  if (tipo === 5) {
    const kg = rand(2,10), g = rand(100,900), totalG = kg*1000+g;
    return { ctx: 'En el supermercado La Colonia de Heredia, una bolsa de frijoles pesa ' + kg + ' kg y ' + g + ' g.', enunciado: '¿Cuántos gramos pesa la bolsa en total?', correcta: totalG + ' g', d: [(kg*1000) + ' g', (totalG+100) + ' g', (totalG-50) + ' g'], pista: '1 kg = 1000 g. Convertí los kilogramos y sumá.', pasos: [{titulo:'Comprender',explicacion:kg + ' kg y ' + g + ' g.'},{titulo:'Plantear',explicacion:kg + ' × 1000 + ' + g},{titulo:'Resolver',explicacion:(kg*1000) + ' + ' + g + ' = ' + totalG + ' g.'},{titulo:'Verificar',explicacion:(kg*1000) + ' + ' + g + ' = ' + totalG + '. ✓'}] };
  }
  const dens = [2,4,5][rand(0,2)], num = rand(1,dens-1), tot = dens*rand(4,12), parte = (tot*num)/dens;
  return { ctx: 'En el Festival de las Frutas de Quepos, una canasta tiene ' + tot + ' frutas tropicales.', enunciado: 'Si ' + num + '/' + dens + ' de las frutas son piñas, ¿cuántas piñas hay?', correcta: parte + ' piñas', d: [(parte+dens) + ' piñas', (tot-parte) + ' piñas', (parte-num) + ' piñas'], pista: 'Para calcular ' + num + '/' + dens + ' de ' + tot + ': dividí ' + tot + ' entre ' + dens + ' y multiplicá por ' + num + '.', pasos: [{titulo:'Comprender',explicacion:'Queremos ' + num + '/' + dens + ' de ' + tot + ' frutas.'},{titulo:'Plantear',explicacion:tot + ' ÷ ' + dens + ' × ' + num},{titulo:'Resolver',explicacion:(tot/dens) + ' × ' + num + ' = ' + parte + '.'},{titulo:'Verificar',explicacion:parte + ' ÷ ' + tot + ' = ' + num + '/' + dens + '. ✓'}] };
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
