// Proxy seguro via Cloudflare Worker (la API Key está en Cloudflare, no aquí)
// IMPORTANTE: Reemplaza esta URL con la de tu Worker después de crearlo
const WORKER_URL = 'https://edunido-api.faridyrg16.workers.dev';
const OPENAI_CHAT_URL = WORKER_URL + '/chat';
const OPENAI_AUDIO_URL = WORKER_URL + '/audio';

//Respuestas pre-cargadas (solo las mínimas indispensables)
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
    keywords: ['plan gratis', 'plan free', 'gratis', 'costo', 'precio', 'planes', 'cuanto cuesta', 'cuánto cuesta'],
    response: 'Empiezas gratis con hasta 30 alumnos y todo digitalizado en minutos 📲, ¿quieres activarlo ahora? 👉 https://wa.me/519295609206'
  },
  {
    keywords: ['facil', 'fácil', 'usar', 'tecnologia', 'complicado', 'complejo', 'sencillo'],
    response: 'Es súper fácil, no necesitas saber de tecnología y todo es guiado paso a paso 😊, ¿te muestro cómo en una demo? 👉 https://wa.me/519295609206'
  },
  {
    keywords: ['pagos', 'cobros', 'controlar pagos', 'mensualidades', 'dinero', 'transacciones', 'facturas'],
    response: 'Controlas todos los pagos en un solo lugar y evitas atrasos o confusiones 💰, ¿quieres verlo en acción? 👉 https://wa.me/519295609206'
  },
  {
    keywords: ['demo', 'demostracion', 'demostración', 'ver', 'probar', 'quiero demo', 'muéstrame', 'muestrame'],
    response: 'Perfecto 🙌 te muestro cómo funciona en minutos, escríbeme y agendamos ahora 👉 https://wa.me/519295609206'
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

// System Prompts - COMPLETO Y SIN TRUNCAR
const SYSTEM_PROMPT = `Eres Nina, asesora comercial de EduNido, un sistema SaaS para jardines de infancia en Cusco. Tu único objetivo es cerrar la conversación en una prueba gratis o demo por WhatsApp.

Habla siempre en español, con tono urgente, directo y persuasivo, pero amable. Escribe como en WhatsApp (natural, corto, cercano).

Propuesta de valor:
- Olvídate del desorden: matrículas, pagos y horarios en un solo lugar
- Funciona online, sin instalaciones ni complicaciones
- Acceso 24/7 desde cualquier dispositivo

Planes:
- Free: S/0 (hasta 30 alumnos)
- Pro: S/50/mes (ilimitado)

Reglas clave:
- Máximo 2 oraciones por respuesta
- Usa preguntas cerradas para empujar decisión
- Genera urgencia (tiempo, orden, facilidad)
- Evita explicaciones largas
- Siempre termina llevando al WhatsApp
- Si no sabes algo relacionado a nidos, sugiere que pregunten sobre EduNido

CTA obligatorio en cada respuesta:
👉 Escríbenos ahora: https://wa.me/519295609206

Ejemplos de respuestas:
- "¿Sigues manejando matrículas y pagos en papel? Con EduNido lo haces en minutos, ¿te muestro cómo? 👉 https://wa.me/519295609206"
- "Empieza gratis hoy y ordena todo tu nido sin estrés, ¿te ayudo a activarlo ahora? 👉 https://wa.me/519295609206"
- "¿Tienes dudas? Agendamos una demo personalizada en 5 minutos 👉 https://wa.me/519295609206"`;
