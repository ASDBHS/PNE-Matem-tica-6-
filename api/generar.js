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

function crearEjercicio() {
  const tipo = rand(0, 6);

  if (tipo === 0) {
    const total = rand(200, 999);
    const div = rand(6, 20);
    const cociente = Math.floor(total / div);
    const resto = total % div;
    return {
      ctx: `En una escuela de Costa Rica se tienen ${total} lápices que deben repartirse en cajas de ${div} unidades cada una.`,
      enunciado: `¿Cuántas cajas completas se pueden llenar?`,
      correcta: `${cociente} cajas`,
      d: [`${cociente + 1} cajas`, `${cociente - 1} cajas`, `${Math.floor(total / (div + 2))} cajas`],
      pista: `Dividí ${total} entre ${div}. El resultado entero (sin el resto) es la cantidad de cajas completas.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Tenemos ${total} lápices y cajas de ${div}. Buscamos cuántas cajas completas.` },
        { titulo: 'Plantear', explicacion: `Operación: ${total} ÷ ${div}` },
        { titulo: 'Resolver', explicacion: `${total} ÷ ${div} = ${cociente} con resto ${resto}. Solo contamos las cajas completas.` },
        { titulo: 'Verificar', explicacion: `${cociente} × ${div} = ${cociente * div}, más ${resto} restantes = ${total}. ✓` }
      ]
    };
  }

  if (tipo === 1) {
    const pct = [10, 20, 25, 50][rand(0, 3)];
    const total = pct === 25 ? rand(2, 20) * 4 : pct === 50 ? rand(2, 20) * 2 : rand(5, 30) * 10;
    const resultado = (total * pct) / 100;
    return {
      ctx: `En un mercado de San José hay ${total} frutas en exhibición.`,
      enunciado: `Si el ${pct}% de las frutas son mangos, ¿cuántos mangos hay?`,
      correcta: `${resultado} mangos`,
      d: [`${resultado + pct} mangos`, `${total - resultado} mangos`, `${resultado + 10} mangos`],
      pista: `Para calcular el ${pct}% de ${total}, multiplicá ${total} × ${pct} y dividí entre 100.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Queremos el ${pct}% de ${total} frutas.` },
        { titulo: 'Plantear', explicacion: `${total} × ${pct} ÷ 100` },
        { titulo: 'Resolver', explicacion: `${total} × ${pct} = ${total * pct}. Luego ${total * pct} ÷ 100 = ${resultado}.` },
        { titulo: 'Verificar', explicacion: `${resultado} es el ${pct}% de ${total}. ✓` }
      ]
    };
  }

  if (tipo === 2) {
    const horas = rand(2, 8);
    const mins = rand(5, 55);
    const totalMin = horas * 60 + mins;
    return {
      ctx: `Una excursión escolar desde Alajuela hasta el Volcán Poás dura ${horas} horas y ${mins} minutos.`,
      enunciado: `¿Cuántos minutos dura la excursión en total?`,
      correcta: `${totalMin} minutos`,
      d: [`${horas * 60} minutos`, `${totalMin + 10} minutos`, `${totalMin - 5} minutos`],
      pista: `Recordá que 1 hora = 60 minutos. Convertí las horas y sumá los minutos adicionales.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Tenemos ${horas} horas y ${mins} minutos. Queremos el total en minutos.` },
        { titulo: 'Plantear', explicacion: `${horas} horas × 60 + ${mins} minutos` },
        { titulo: 'Resolver', explicacion: `${horas} × 60 = ${horas * 60}. Más ${mins} = ${totalMin} minutos.` },
        { titulo: 'Verificar', explicacion: `${horas * 60} + ${mins} = ${totalMin}. ✓` }
      ]
    };
  }

  if (tipo === 3) {
    const base = rand(5, 25);
    const altura = rand(3, 15);
    const area = base * altura;
    const perim = 2 * (base + altura);
    return {
      ctx: `Un agricultor de Cartago tiene un terreno rectangular que mide ${base} metros de largo y ${altura} metros de ancho.`,
      enunciado: `¿Cuál es el área del terreno?`,
      correcta: `${area} m²`,
      d: [`${perim} m²`, `${area + base} m²`, `${area - altura} m²`],
      pista: `El área de un rectángulo = base × altura.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Terreno de ${base} m × ${altura} m. Queremos el área.` },
        { titulo: 'Plantear', explicacion: `Área = base × altura = ${base} × ${altura}` },
        { titulo: 'Resolver', explicacion: `${base} × ${altura} = ${area} m²` },
        { titulo: 'Verificar', explicacion: `${area} ÷ ${base} = ${altura}. ✓` }
      ]
    };
  }

  if (tipo === 4) {
    const inc = rand(3, 15);
    const ini = rand(2, 20);
    const seq = [0, 1, 2, 3, 4].map(i => ini + inc * i);
    return {
      ctx: `Una estudiante de 6° grado observa el siguiente patrón numérico en su cuaderno.`,
      enunciado: `Completá la sucesión: ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ___`,
      correcta: `${seq[4]}`,
      d: [`${seq[4] + inc}`, `${seq[4] - 1}`, `${seq[3] + inc - 1}`],
      pista: `Calculá la diferencia entre cada par de números consecutivos. ¿Es siempre la misma?`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Sucesión: ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}. Buscamos el siguiente.` },
        { titulo: 'Identificar patrón', explicacion: `${seq[1]}-${seq[0]}=${inc}, ${seq[2]}-${seq[1]}=${inc}, ${seq[3]}-${seq[2]}=${inc}. Incremento constante: ${inc}.` },
        { titulo: 'Resolver', explicacion: `${seq[3]} + ${inc} = ${seq[4]}.` },
        { titulo: 'Verificar', explicacion: `Sucesión completa: ${seq.join(', ')}. Diferencia constante de ${inc}. ✓` }
      ]
    };
  }

  if (tipo === 5) {
    const kg = rand(2, 10);
    const g = rand(100, 900);
    const totalG = kg * 1000 + g;
    return {
      ctx: `En una pulpería de Heredia se vende una bolsa que contiene ${kg} kg y ${g} g de arroz.`,
      enunciado: `¿Cuántos gramos pesa la bolsa en total?`,
      correcta: `${totalG} g`,
      d: [`${kg * 1000} g`, `${totalG + 100} g`, `${totalG - 50} g`],
      pista: `Recordá que 1 kg = 1000 g. Convertí los kilogramos a gramos y sumá.`,
      pasos: [
        { titulo: 'Comprender', explicacion: `Tenemos ${kg} kg y ${g} g. Todo en gramos.` },
        { titulo: 'Plantear', explicacion: `${kg} × 1000 + ${g}` },
        { titulo: 'Resolver', explicacion: `${kg} × 1000 = ${kg * 1000}. Más ${g} g = ${totalG} g.` },
        { titulo: 'Verificar', explicacion: `${kg * 1000} + ${g} = ${totalG} g. ✓` }
      ]
    };
  }

  // tipo === 6: fracciones
  const dens = [2, 4, 5][rand(0, 2)];
  const num = rand(1, dens - 1);
  const tot = dens * rand(4, 12);
  const parte = (tot * num) / dens;
  return {
    ctx: `En una canasta del mercado de Limón hay ${tot} frutas de diferentes tipos.`,
    enunciado: `Si ${num}/${dens} de las frutas son piñas, ¿cuántas piñas hay?`,
    correcta: `${parte} piñas`,
    d: [`${parte + dens} piñas`, `${tot - parte} piñas`, `${parte - num} piñas`],
    pista: `Para encontrar ${num}/${dens} de ${tot}: dividí ${tot} entre ${dens} y multiplicá por ${num}.`,
    pasos: [
      { titulo: 'Comprender', explicacion: `Queremos ${num}/${dens} de ${tot} frutas.` },
      { titulo: 'Plantear', explicacion: `${tot} ÷ ${dens} × ${num}` },
      { titulo: 'Resolver', explicacion: `${tot} ÷ ${dens} = ${tot / dens}. Luego ${tot / dens} × ${num} = ${parte}.` },
      { titulo: 'Verificar', explicacion: `${parte} ÷ ${tot} = ${num / dens} = ${num}/${dens}. ✓` }
    ]
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const ej = crearEjercicio();
    const { opciones, clave } = mezclar(
      { A: ej.correcta, B: ej.d[0], C: ej.d[1], D: ej.d[2] },
      'A'
    );

    // Enriquecer contexto con Groq (opcional — si falla igual devuelve el ejercicio)
    let contexto = ej.ctx;
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 120,
          temperature: 0.8,
          messages: [{
            role: 'user',
            content: `Reescribí este contexto con más detalle costarricense (máximo 2 oraciones, no cambies los números): "${ej.ctx}". Respondé SOLO con el texto, sin comillas.`
          }]
        })
      });
      const groqData = await groqRes.json();
      const texto = groqData.choices?.[0]?.message?.content?.trim();
      if (texto && texto.length > 10) contexto = texto;
    } catch(e) { /* usar contexto base */ }

    return res.status(200).json({
      contexto_situacional: contexto,
      enunciado: ej.enunciado,
      opciones,
      clave,
      pista: ej.pista,
      pasos_resolucion: ej.pasos
    });

  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
