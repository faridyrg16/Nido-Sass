const WORKER_URL = 'https://edunido-api.faridyrg16.workers.dev';
const OPENAI_CHAT_URL = WORKER_URL + '/chat';
const OPENAI_AUDIO_URL = WORKER_URL + '/audio';

const PREDEFINED_RESPONSES = [
  {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'hi', 'ola', 'buenos', 'buenas'],
    response: '¡Hola! Soy Nina 🌿, tu asistente de EduNido. ¿En qué puedo ayudarte hoy con la gestión de tu nido?'
  },
  {
    keywords: ['chau', 'adiós', 'adios', 'bye', 'nos vemos', 'hasta luego', 'hasta pronto'],
    response: '¡Hasta pronto! Recuerda que puedes volver cuando quieras. ¡Estoy aquí 24/7 para ayudarte! 🌿👋'
  },
  {
    keywords: ['gracias', 'muchas gracias', 'gracias por', 'thank you', 'thanks'],
    response: '¡Con gusto! Si tienes más preguntas no dudes en escribirme. 🌿💚'
  },
  {
    keywords: ['plan gratis', 'plan free', 'gratis', 'costo', 'precio', 'planes', 'cuanto cuesta', 'cuánto cuesta', 'cómo funciona el plan gratis'],
    response: 'Empiezas gratis con hasta 30 alumnos, sin tarjeta de crédito. Todo está digitalizado en minutos y accedes 24/7 desde cualquier dispositivo 📲 ¿Quieres activarlo ahora? 👉 https://wa.me/519295609206'
  },
  {
    keywords: ['fácil', 'facil', 'sin saber tecnología', 'tecnologia', 'complicado', 'complejo', 'sencillo', 'fácil de usar', 'es fácil de usar sin saber de tecnología'],
    response: 'Es súper fácil 💪. No necesitas saber de tecnología, todo es guiado paso a paso. Ordenas matrículas, pagos y horarios en minutos sin estrés. ¿Te muestro cómo? 👉 https://wa.me/519295609206'
  },
  {
    keywords: ['pagos', 'cobros', 'controlar pagos', 'mensualidades', 'dinero', 'transacciones', 'facturas', 'cómo controlo los pagos'],
    response: 'Controlas todos los pagos en un solo lugar, ves quién pagó y quién adeuda, y evitas atrasos o confusiones 💰. Es automático y seguro. ¿Quieres verlo en acción? 👉 https://wa.me/519295609206'
  },
  {
    keywords: ['demo', 'demostracion', 'demostración', 'ver', 'probar', 'quiero demo', 'quiero una demo', 'muéstrame', 'muestrame'],
    response: 'Perfecto 🙌 Te muestro cómo funciona en 5 minutos y respondes todas tus dudas. Escríbeme ahora para agendar 👉 https://wa.me/519295609206'
  }
];


let lastFallbackIndex = -1;
const FALLBACK_RESPONSES = [
  'Hmm, parece que tuve un problema técnico momentáneo. ¿Podrías escribirme de nuevo? 😊 O mejor aún, contáctame directo por WhatsApp 👉 https://wa.me/519295609206',
  'Disculpa, algo falló de mi lado. Intenta de nuevo o escríbeme por WhatsApp para ayudarte mejor 👉 https://wa.me/519295609206',
  'Error momentáneo de mi parte 😅. Por favor intenta de nuevo o contáctame por WhatsApp 👉 https://wa.me/519295609206'
];

const SYSTEM_PROMPT = `Eres Nina, asesora comercial de EduNido, un sistema SaaS para jardines de infancia en Cusco.

Tu objetivo es ayudar a directoras de nidos con cualquier pregunta, pero siempre intentando conectarlas con EduNido cuando sea relevante.

PERSONALIDAD Y TONO:
- Habla SIEMPRE en español, con tono amable, cercano y conversacional
- Escribe como en WhatsApp (natural, corto, emojis, sin formalismos)
- Sé empático y genuinamente útil

PROPUESTA DE VALOR DE EDUNIDO:
- ✅ Olvídate del desorden: matrículas, pagos y horarios en un solo lugar
- ✅ Funciona online, sin instalaciones ni complicaciones
- ✅ Acceso 24/7 desde cualquier dispositivo (celular, tablet, PC)
- ✅ Empieza gratis con hasta 30 alumnos, sin tarjeta de crédito

PLANES:
- Free: S/0 (hasta 30 alumnos, todas las funciones básicas)
- Pro: S/50/mes (alumnos ilimitados, reportes avanzados)

REGLAS DE RESPUESTA:
1. MÁXIMO 2-3 oraciones por mensaje (sé conciso)
2. Responde DIRECTAMENTE a lo que pregunten, cualquier tema
3. Si preguntan sobre EduNido o gestión de nidos → responde con seguridad y lleva al WhatsApp
4. Si preguntan algo fuera de tema → responde brevemente, sé amable, pero NO OBLIGUES el redireccionamiento
5. Si el tema se relaciona con EduNido, menciona cómo podría ayudar la plataforma
6. Sé genuinamente útil, no solo vendedor

TEMAS SOBRE LOS QUE PUEDES RESPONDER CON SEGURIDAD:
- Cómo funciona el sistema (matrículas, pagos, horarios, reportes)
- Planes y precios
- Facilidad de uso sin conocimientos técnicos
- Cómo empezar gratis
- Demos y pruebas
- Beneficios para directoras de nidos
- Preguntas generales sobre educación, nidos y gestión

IMPORTANTE:
- Responde cualquier pregunta naturalmente
- Si el usuario pregunta algo off-topic, responde sin problema
- Adapta tu respuesta al contexto de la conversación
- Solo menciona WhatsApp cuando sea contextualmente relevante
- Sé conversacional y humana`;
