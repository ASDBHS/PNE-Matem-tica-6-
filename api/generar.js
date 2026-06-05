// ══════════════════════════════════════════════════════════
//  GENERADOR UNIFICADO — 4 Materias · SDBHS · DGEC 2026
//  Matemáticas: plantillas exactas + IA para contexto
//  Español, Ciencias, Estudios Sociales: IA completa
// ══════════════════════════════════════════════════════════

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mezclar(opciones, claveOriginal) {
  const letras = ['A','B','C','D'];
  const textos = letras.map(l => opciones[l]);
  for(let i=textos.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[textos[i],textos[j]]=[textos[j],textos[i]];}
  const textoCorrecta = opciones[claveOriginal];
  const nuevas={};let nuevaClave='';
  letras.forEach((l,i)=>{nuevas[l]=textos[i];if(textos[i]===textoCorrecta)nuevaClave=l;});
  return {opciones:nuevas,clave:nuevaClave};
}

// ── PLANTILLAS MATEMÁTICAS (siempre correctas) ────────────
function crearEjercicioMat() {
  const tipo = rand(0,6);
  if(tipo===0){
    const total=rand(200,999),div=rand(6,20),cociente=Math.floor(total/div),resto=total%div;
    return {ctx:`En una escuela de Costa Rica se tienen ${total} lápices que deben repartirse en cajas de ${div} unidades cada una.`,enunciado:`¿Cuántas cajas completas se pueden llenar?`,correcta:`${cociente} cajas`,d:[`${cociente+1} cajas`,`${cociente-1} cajas`,`${Math.floor(total/(div+2))} cajas`],pista:`Dividí ${total} entre ${div}. Solo contamos las cajas completas, no el sobrante.`,pasos:[{titulo:'Comprender',explicacion:`${total} lápices en cajas de ${div}.`},{titulo:'Plantear',explicacion:`${total} ÷ ${div}`},{titulo:'Resolver',explicacion:`${total} ÷ ${div} = ${cociente} con resto ${resto}.`},{titulo:'Verificar',explicacion:`${cociente} × ${div} = ${cociente*div} + ${resto} = ${total}. ✓`}]};
  }
  if(tipo===1){
    const pct=[10,20,25,50][rand(0,3)];const total=pct===25?rand(2,20)*4:pct===50?rand(2,20)*2:rand(5,30)*10;const resultado=(total*pct)/100;
    return {ctx:`En un mercado de San José hay ${total} frutas en exhibición.`,enunciado:`Si el ${pct}% de las frutas son mangos, ¿cuántos mangos hay?`,correcta:`${resultado} mangos`,d:[`${resultado+pct} mangos`,`${total-resultado} mangos`,`${resultado+10} mangos`],pista:`${pct}% de ${total}: multiplicá ${total} × ${pct} y dividí entre 100.`,pasos:[{titulo:'Comprender',explicacion:`${pct}% de ${total}.`},{titulo:'Plantear',explicacion:`${total} × ${pct} ÷ 100`},{titulo:'Resolver',explicacion:`${total*pct} ÷ 100 = ${resultado}.`},{titulo:'Verificar',explicacion:`${resultado} es el ${pct}% de ${total}. ✓`}]};
  }
  if(tipo===2){
    const horas=rand(2,8),mins=rand(5,55),totalMin=horas*60+mins;
    return {ctx:`Una excursión escolar desde Alajuela hasta el Volcán Poás dura ${horas} horas y ${mins} minutos.`,enunciado:`¿Cuántos minutos dura la excursión en total?`,correcta:`${totalMin} minutos`,d:[`${horas*60} minutos`,`${totalMin+10} minutos`,`${totalMin-5} minutos`],pista:`1 hora = 60 minutos. Convertí las horas y sumá.`,pasos:[{titulo:'Comprender',explicacion:`${horas} horas y ${mins} minutos.`},{titulo:'Plantear',explicacion:`${horas} × 60 + ${mins}`},{titulo:'Resolver',explicacion:`${horas*60} + ${mins} = ${totalMin} min.`},{titulo:'Verificar',explicacion:`${horas*60} + ${mins} = ${totalMin}. ✓`}]};
  }
  if(tipo===3){
    const base=rand(5,25),altura=rand(3,15),area=base*altura,perim=2*(base+altura);
    return {ctx:`Un agricultor de Cartago tiene un terreno rectangular de ${base} m de largo y ${altura} m de ancho.`,enunciado:`¿Cuál es el área del terreno?`,correcta:`${area} m²`,d:[`${perim} m²`,`${area+base} m²`,`${area-altura} m²`],pista:`Área = base × altura.`,pasos:[{titulo:'Comprender',explicacion:`${base} m × ${altura} m.`},{titulo:'Plantear',explicacion:`${base} × ${altura}`},{titulo:'Resolver',explicacion:`${base} × ${altura} = ${area} m²`},{titulo:'Verificar',explicacion:`${area} ÷ ${base} = ${altura}. ✓`}]};
  }
  if(tipo===4){
    const inc=rand(3,15),ini=rand(2,20),seq=[0,1,2,3,4].map(i=>ini+inc*i);
    return {ctx:`Una estudiante de 6° grado observa el siguiente patrón numérico.`,enunciado:`Completá la sucesión: ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ___`,correcta:`${seq[4]}`,d:[`${seq[4]+inc}`,`${seq[4]-1}`,`${seq[3]+inc-1}`],pista:`Calculá la diferencia entre cada par. ¿Es constante?`,pasos:[{titulo:'Comprender',explicacion:`${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}.`},{titulo:'Identificar patrón',explicacion:`Diferencia constante: ${inc}.`},{titulo:'Resolver',explicacion:`${seq[3]} + ${inc} = ${seq[4]}.`},{titulo:'Verificar',explicacion:`Sucesión: ${seq.join(', ')}. ✓`}]};
  }
  if(tipo===5){
    const kg=rand(2,10),g=rand(100,900),totalG=kg*1000+g;
    return {ctx:`En una pulpería de Heredia se vende una bolsa con ${kg} kg y ${g} g de arroz.`,enunciado:`¿Cuántos gramos pesa la bolsa en total?`,correcta:`${totalG} g`,d:[`${kg*1000} g`,`${totalG+100} g`,`${totalG-50} g`],pista:`1 kg = 1000 g. Convertí y sumá.`,pasos:[{titulo:'Comprender',explicacion:`${kg} kg y ${g} g.`},{titulo:'Plantear',explicacion:`${kg} × 1000 + ${g}`},{titulo:'Resolver',explicacion:`${kg*1000} + ${g} = ${totalG} g.`},{titulo:'Verificar',explicacion:`${kg*1000} + ${g} = ${totalG}. ✓`}]};
  }
  const dens=[2,4,5][rand(0,2)],num=rand(1,dens-1),tot=dens*rand(4,12),parte=(tot*num)/dens;
  return {ctx:`En una canasta del mercado de Limón hay ${tot} frutas de diferentes tipos.`,enunciado:`Si ${num}/${dens} de las frutas son piñas, ¿cuántas piñas hay?`,correcta:`${parte} piñas`,d:[`${parte+dens} piñas`,`${tot-parte} piñas`,`${parte-num} piñas`],pista:`${num}/${dens} de ${tot}: dividí entre ${dens} y multiplicá por ${num}.`,pasos:[{titulo:'Comprender',explicacion:`${num}/${dens} de ${tot}.`},{titulo:'Plantear',explicacion:`${tot} ÷ ${dens} × ${num}`},{titulo:'Resolver',explicacion:`${tot/dens} × ${num} = ${parte}.`},{titulo:'Verificar',explicacion:`${parte}/${tot} = ${num}/${dens}. ✓`}]};
}

// ── PROMPTS POR MATERIA ───────────────────────────────────
const PROMPTS = {
  ss: (bloque, af) => `Eres un generador experto de ítems de selección única para la Prueba Nacional Estandarizada Diagnóstica de Estudios Sociales 2026 de Costa Rica (DGEC), 6° grado primaria.

BLOQUE: ${bloque}
AFIRMACIÓN: ${af}

REGLAS:
- Contexto real costarricense o situación histórica concreta.
- 4 opciones: una correcta, tres distractores plausibles que representen errores de comprensión típicos.
- Dificultad intermedia: el estudiante debe analizar, comparar o inferir, no solo recordar.
- Variá el tipo: identificación, comparación, causa-efecto, inferencia o aplicación.
- VERIFICÁ que la clave sea correcta antes de responder.

Respondé SOLO con JSON:
{"contexto_situacional":"situación breve o vacío","enunciado":"la pregunta completa","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"letra","pista":"orientación sin revelar la respuesta","pasos_resolucion":[{"titulo":"Identificar el tema","explicacion":"..."},{"titulo":"Analizar la pregunta","explicacion":"..."},{"titulo":"Determinar la respuesta","explicacion":"..."},{"titulo":"Verificar","explicacion":"..."}]}`,

  esp: (bloque, af) => `Eres un generador experto de ítems de selección única para la Prueba Nacional Estandarizada Sumativa de Español (Comprensión Lectora) 2026 de Costa Rica (DGEC), 6° grado primaria.

AFIRMACIÓN: ${af}

REGLAS IMPORTANTES:
- Creá un texto breve (3-6 oraciones) como contexto: puede ser un párrafo informativo (no literario) o un fragmento narrativo (literario).
- La pregunta debe basarse en el texto del contexto — el estudiante no puede responder sin leerlo.
- Evaluá comprensión profunda: ideas principales, causa-efecto, inferencias, pensamientos de personajes o conflictos.
- NO evalúes memorización de definiciones.
- 4 opciones: una correcta, tres distractores plausibles basados en errores de comprensión.
- Dificultad intermedia-avanzada.

Respondé SOLO con JSON:
{"contexto_situacional":"el texto que el estudiante debe leer (3-6 oraciones)","enunciado":"la pregunta sobre el texto","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"letra","pista":"orientación para analizar el texto sin revelar la respuesta","pasos_resolucion":[{"titulo":"Leer el texto","explicacion":"..."},{"titulo":"Identificar lo que pregunta","explicacion":"..."},{"titulo":"Analizar las opciones","explicacion":"..."},{"titulo":"Verificar","explicacion":"..."}]}`,

  cien: (bloque, af) => `Eres un generador experto de ítems de selección única para la Prueba Nacional Estandarizada Sumativa de Ciencias 2026 de Costa Rica (DGEC), 6° grado primaria.

BLOQUE: ${bloque}
AFIRMACIÓN: ${af}

REGLAS:
- Presentá una situación, dato científico, imagen descrita o fenómeno natural como contexto.
- La pregunta debe requerir comprensión o aplicación, no solo memorización.
- 4 opciones: una correcta, tres distractores que representen errores conceptuales comunes.
- Dificultad intermedia.
- Usá contextos de Costa Rica cuando sea posible (parques nacionales, volcanes, biodiversidad costarricense).

Respondé SOLO con JSON:
{"contexto_situacional":"situación o dato científico (2-3 oraciones)","enunciado":"la pregunta","opciones":{"A":"...","B":"...","C":"...","D":"..."},"clave":"letra","pista":"orientación conceptual sin revelar la respuesta","pasos_resolucion":[{"titulo":"Comprender la situación","explicacion":"..."},{"titulo":"Identificar el concepto clave","explicacion":"..."},{"titulo":"Analizar las opciones","explicacion":"..."},{"titulo":"Verificar","explicacion":"..."}]}`
};

// ── GENERAR VÍA IA (Estudios Sociales, Español, Ciencias) ──
async function crearEjercicioIA(materia, bloque, afirmacion) {
  const prompt = PROMPTS[materia](bloque, afirmacion);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.GROQ_API_KEY}`},
    body: JSON.stringify({
      model:'llama-3.3-70b-versatile',
      max_tokens:1500,
      temperature:0.85,
      response_format:{type:'json_object'},
      messages:[{role:'user',content:prompt}]
    })
  });
  const datos = await res.json();
  if(datos.error) throw new Error(datos.error.message);
  const texto = datos.choices?.[0]?.message?.content||'';
  const ini=texto.indexOf('{'),fin=texto.lastIndexOf('}');
  if(ini===-1||fin===-1) throw new Error('Sin JSON válido');
  return JSON.parse(texto.substring(ini,fin+1));
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'Método no permitido'});

  const {materia, bloque, afirmacion} = req.body;

  try {
    if(materia === 'mat') {
      // Matemáticas: plantilla exacta + enriquecimiento IA opcional
      const ej = crearEjercicioMat();
      let contexto = ej.ctx;
      try {
        const gr = await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.GROQ_API_KEY}`},
          body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:100,temperature:0.8,
            messages:[{role:'user',content:`Reescribí este contexto con más detalle costarricense (máximo 2 oraciones, sin cambiar números): "${ej.ctx}". Respondé SOLO con el texto.`}]})
        });
        const gd=await gr.json();
        const t=gd.choices?.[0]?.message?.content?.trim();
        if(t&&t.length>10) contexto=t;
      } catch(e){}
      const {opciones,clave}=mezclar({A:ej.correcta,B:ej.d[0],C:ej.d[1],D:ej.d[2]},'A');
      return res.status(200).json({contexto_situacional:contexto,enunciado:ej.enunciado,opciones,clave,pista:ej.pista,pasos_resolucion:ej.pasos});

    } else {
      // SS, Español, Ciencias: generado por IA
      const ejercicio = await crearEjercicioIA(materia, bloque, afirmacion);
      if(!ejercicio.enunciado||!ejercicio.opciones||!ejercicio.clave) throw new Error('Respuesta incompleta de la IA');
      const {opciones,clave}=mezclar(ejercicio.opciones,ejercicio.clave);
      ejercicio.opciones=opciones; ejercicio.clave=clave;
      return res.status(200).json(ejercicio);
    }

  } catch(err) {
    console.error(err);
    return res.status(500).json({error:err.message});
  }
};
