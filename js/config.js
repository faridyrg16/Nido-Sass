const OPENAI_API_KEY = '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';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_AUDIO_URL = 'https://api.openai.com/v1/audio/transcriptions';

//Respuestas pre-cargadas
const PREDEFINED_RESPONSES = [
  {
    keywords: ['precio', 'costo', 'planes', 'cuanto cuesta', 'pagar'],
    response: 'Tenemos un **Plan Free (S/0 siempre)** para hasta 30 alumnos y un **Plan Pro (S/50/mes)** con alumnos ilimitados y funciones avanzadas. Puedes empezar gratis y probarlo sin riesgo. 🚀'
  },
  {
    keywords: ['gratis', 'free', 'plan free', 'plan gratis'],
    response: 'El **Plan Free es S/0 para siempre**. Incluye hasta 30 alumnos, 1 aula, matrículas, control de pagos y soporte por WhatsApp. ¡Ideal para empezar! 🌿'
  },
  {
    keywords: ['demo', 'demostración', 'probar', 'prueba'],
    response: '¡Claro! Puedes empezar a probarlo tú misma gratis haciendo clic en "Prueba gratis", o si prefieres, podemos agendar una demo personalizada. ¿Qué te acomoda más? 😊'
  },
  {
    keywords: ['whatsapp', 'notificaciones'],
    response: '¡Sí! EduNido envía notificaciones y recibos de pago directamente al WhatsApp de los padres de familia. Es súper práctico y ellos ya saben usarlo. 📱'
  },
  {
    keywords: ['facil', 'difícil', 'tecnología', 'usar', 'sencillo'],
    response: 'EduNido está diseñado para ser **extremadamente fácil de usar**. Si sabes usar WhatsApp, sabes usar EduNido. Además, no requiere instalación, funciona desde tu navegador. ✨'
  },
  {
    keywords: ['pagos', 'cobros', 'morosos', 'deudas'],
    response: 'Con EduNido llevas el control de mensualidades y recibes alertas de morosidad. Los padres reciben un recibo automático por WhatsApp al pagar. ¡Cobra más fácil y organizado! 💳'
  },
  {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'],
    response: '¡Hola! Soy Nina 🌿. ¿En qué puedo ayudarte hoy con la gestión de tu nido?'
  }
];

// System Prompts
const SYSTEM_PROMPT = `Eres Nina, la asistente virtual de EduNido, un sistema SaaS de gestión académica freemium diseñado específicamente para jardines de infancia (nidos) en Cusco, Perú.
Tu objetivo es VENDER el producto de forma amigable, empática y directa. Responde SIEMPRE en español, de manera conversacional y cálida.
INFORMACIÓN:
- Digitaliza matrículas, pagos y horarios. Sin instalaciones.
- Plan Free: S/0, 30 alumnos.
- Plan Pro: S/50/mes, ilimitado.
Responde de forma MUY breve (2 oraciones máximo) y lleva siempre al usuario a probar gratis o agendar demo.`;
