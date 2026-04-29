// Proxy seguro via Cloudflare Worker (la API Key está en Cloudflare, no aquí)
// IMPORTANTE: Reemplaza esta URL con la de tu Worker después de crearlo
const WORKER_URL = 'https://edunido-api.faridyrg16.workers.dev';
const OPENAI_CHAT_URL = WORKER_URL + '/chat';
const OPENAI_AUDIO_URL = WORKER_URL + '/audio';

//Respuestas pre-cargadas (solo las mínimas indispensables)
const PREDEFINED_RESPONSES = [
  {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'hi', 'ola'],
    response: '¡Hola! Soy Nina 🌿, tu asistente de EduNido. ¿En qué puedo ayudarte hoy con la gestión de tu nido?'
  },
  {
    keywords: ['chau', 'adiós', 'adios', 'bye', 'nos vemos', 'hasta luego'],
    response: '¡Hasta pronto! Recuerda que puedes volver cuando quieras. ¡Estoy aquí 24/7 para ayudarte! 🌿👋'
  },
  {
    keywords: ['gracias', 'muchas gracias'],
    response: '¡Con gusto! Si tienes más preguntas no dudes en escribirme. 🌿💚'
  }
];

// Respuestas cuando no hay match local (Fallback si la API falla)
let lastFallbackIndex = -1;
const FALLBACK_RESPONSES = [
  'Hmm, eso está fuera de mi área 😅. Soy Nina y solo puedo ayudarte con la gestión de nidos: matrículas, pagos, horarios... ¿Te cuento sobre alguna de estas funciones?',
  'Disculpa, no tengo información sobre eso. Mi especialidad es ayudarte con la **gestión de tu nido**. ¿Tienes alguna duda sobre EduNido? 🌿',
  'Uy, eso no lo manejo 😊. Pero si necesitas ayuda con matrículas, cobros o horarios de tu nido, ¡ahí sí soy experta! ¿En qué te ayudo?',
  'No puedo ayudarte con eso, pero sí con todo lo relacionado a la gestión de jardines de infancia. ¿Quieres saber cómo **EduNido** puede simplificar tu trabajo? 💚',
  'Esa pregunta se escapa de lo que sé 😅. Yo me especializo en ayudar a directoras de nidos en Cusco. ¿Tienes alguna duda sobre nuestros planes o funciones?',
  'Lo siento, no tengo respuesta para eso. Pero puedo contarte todo sobre cómo digitalizar la gestión de tu nido. ¿Qué te gustaría saber? 🌿',
  'Mmm, eso no es algo en lo que pueda ayudarte. ¿Pero sabías que puedes gestionar matrículas, pagos y horarios desde tu celular con EduNido? Pregúntame sobre eso 😊',
  'No manejo ese tema, disculpa. Mi fuerte es ayudar con la administración de nidos y jardines. ¿Te interesa saber sobre precios, funciones o cómo empezar? ✨'
];

// System Prompts
const SYSTEM_PROMPT = `Eres Nina, la asistente virtual de EduNido, un sistema SaaS de gestión académica freemium diseñado específicamente para jardines de infancia (nidos) en Cusco, Perú.
Tu objetivo es VENDER el producto de forma amigable, empática y directa. Responde SIEMPRE en español, de manera conversacional y cálida.
INFORMACIÓN:
- Digitaliza matrículas, pagos y horarios. Sin instalaciones.
- Plan Free: S/0, 30 alumnos.
- Plan Pro: S/50/mes, ilimitado.
Responde de forma MUY breve (2 oraciones máximo) y lleva siempre al usuario a probar gratis o agendar demo.`;
