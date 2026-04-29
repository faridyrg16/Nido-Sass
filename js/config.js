const OPENAI_API_KEY = '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';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_AUDIO_URL = 'https://api.openai.com/v1/audio/transcriptions';

//Respuestas pre-cargadas
const PREDEFINED_RESPONSES = [
  // Saludos
  {
    keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'hi', 'ola'],
    response: '¡Hola! Soy Nina 🌿, tu asistente de EduNido. ¿En qué puedo ayudarte hoy con la gestión de tu nido?'
  },
  // Precios y planes
  {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'cuánto cuesta', 'cuanto vale', 'tarifas', 'mensualidad del sistema'],
    response: 'Tenemos un **Plan Free (S/0 siempre)** para hasta 30 alumnos y un **Plan Pro (S/50/mes)** con alumnos ilimitados y funciones avanzadas. ¡Puedes empezar gratis y sin tarjeta! 🚀'
  },
  {
    keywords: ['gratis', 'free', 'plan free', 'plan gratis', 'sin pagar', 'no pagar'],
    response: 'El **Plan Free es S/0 para siempre**. Incluye hasta 30 alumnos, 1 aula, matrículas, control de pagos y soporte por WhatsApp. ¡No necesitas tarjeta de crédito! 🌿'
  },
  {
    keywords: ['pro', 'plan pro', 'premium', 'avanzado', 'completo'],
    response: 'El **Plan Pro cuesta S/50/mes** sin permanencia. Incluye alumnos ilimitados, múltiples aulas y usuarios, reportes avanzados, notificaciones WhatsApp y soporte VIP prioritario. ¡Vale cada sol! 🌟'
  },
  {
    keywords: ['planes', 'comparar', 'diferencia entre'],
    response: 'Tenemos 2 planes:\n• **Free (S/0):** 30 alumnos, 1 aula, funciones básicas\n• **Pro (S/50/mes):** Ilimitado, reportes, WhatsApp, soporte VIP\n\n¿Quieres empezar con el plan gratis? 😊'
  },
  // Demo y prueba
  {
    keywords: ['demo', 'demostración', 'probar', 'prueba', 'ver como funciona', 'mostrar'],
    response: '¡Claro! Puedes empezar a probarlo gratis ahora mismo haciendo clic en "Prueba gratis", o si prefieres te agendamos una demo personalizada por WhatsApp. ¿Qué te acomoda más? 😊'
  },
  // WhatsApp y notificaciones
  {
    keywords: ['whatsapp', 'notificaciones', 'avisos', 'alertas', 'mensajes'],
    response: '¡Sí! EduNido envía **notificaciones y recibos de pago** directamente al WhatsApp de los padres. También alertas de morosidad y recordatorios de eventos. ¡Todo automático! 📱'
  },
  // Facilidad de uso
  {
    keywords: ['facil', 'fácil', 'difícil', 'dificil', 'tecnología', 'tecnologia', 'complicado', 'sencillo', 'aprender'],
    response: 'EduNido está diseñado para ser **extremadamente fácil de usar**. Si sabes usar WhatsApp, sabes usar EduNido. El onboarding toma solo 3 minutos y funciona desde tu navegador sin instalar nada. ✨'
  },
  // Pagos y cobros
  {
    keywords: ['pagos', 'cobros', 'morosos', 'deudas', 'cobrar', 'mensualidades', 'recibos'],
    response: 'Con EduNido llevas el **control total de mensualidades**: alertas de morosidad automáticas, recibos por WhatsApp y un tablero visual para ver quién pagó y quién no. ¡Cobra más fácil! 💳'
  },
  // Matrículas
  {
    keywords: ['matrícula', 'matricula', 'matriculas', 'inscripción', 'inscripcion', 'registrar', 'registro alumno'],
    response: '¡Adiós cuadernos! Con EduNido registras alumnos, datos de apoderados y expedientes en un **formulario digital simple**. Toda la info queda segura en la nube y accesible desde cualquier dispositivo. 📝'
  },
  // Horarios
  {
    keywords: ['horario', 'horarios', 'calendario', 'evento', 'eventos', 'actividad', 'actividades', 'aulas'],
    response: 'EduNido tiene un **calendario visual** para gestionar aulas, maestros y actividades. Puedes compartir el horario con los padres en un solo clic. ¡Super práctico! 🗓️'
  },
  // Reportes
  {
    keywords: ['reporte', 'reportes', 'informe', 'informes', 'estadísticas', 'estadisticas', 'datos', 'ugel'],
    response: 'Generamos **reportes automáticos**: cierre mensual, asistencia y flujo de caja en segundos. Todo listo si UGEL o tu directorio te pide información. 📊'
  },
  // Seguridad
  {
    keywords: ['seguro', 'seguridad', 'datos seguros', 'nube', 'respaldo', 'backup', 'perder datos'],
    response: 'Toda la información está **respaldada y segura en la nube**. Sin USB perdidos, sin cuadernos que se mojan. Accede desde cualquier dispositivo, en cualquier momento. 🔒'
  },
  // Cusco / localización
  {
    keywords: ['cusco', 'cuzco', 'perú', 'peru', 'local'],
    response: '¡EduNido fue **diseñado especialmente para nidos de Cusco**! Entendemos las necesidades de las directoras de la región y ya hay nidos usándolo en San Sebastián, Wanchaq y Santiago. 🌿'
  },
  // Competencia
  {
    keywords: ['otro sistema', 'competencia', 'alternativa', 'mejor', 'diferente', 'por qué edunido', 'porque edunido'],
    response: 'EduNido se diferencia porque: 1) Es **gratis para empezar**, 2) Diseñado para nidos (no colegios grandes), 3) Funciona con WhatsApp que ya usan, y 4) No necesita instalación. ¡Pruébalo tú misma! 💪'
  },
  // Soporte
  {
    keywords: ['soporte', 'ayuda', 'problema', 'error', 'contacto', 'contactar', 'llamar', 'teléfono'],
    response: 'Nuestro equipo de soporte te atiende por **WhatsApp**. En el Plan Pro tienes soporte VIP prioritario. ¡Siempre estamos aquí para ayudarte! 💬'
  },
  // Cómo empezar
  {
    keywords: ['empezar', 'comenzar', 'iniciar', 'registrar', 'crear cuenta', 'inscribirme', 'cómo funciona', 'como funciona'],
    response: 'Empezar es súper fácil: 1) Haz clic en "**Prueba gratis**", 2) Registra tu nido en 3 minutos, 3) ¡Empieza a gestionar! Sin tarjeta, sin instalaciones. ¿Lista para probarlo? 🚀'
  },
  // Alumnos
  {
    keywords: ['alumnos', 'estudiantes', 'niños', 'niñas', 'cuantos alumnos', 'límite'],
    response: 'En el **Plan Free** puedes tener hasta 30 alumnos. Con el **Plan Pro** son **ilimitados**. La mayoría de nidos en Cusco tienen entre 20 y 60 alumnos, así que tenemos el plan perfecto para ti. 👦👧'
  },
  // Usuarios / profesores
  {
    keywords: ['usuario', 'usuarios', 'profesor', 'profesora', 'maestro', 'maestra', 'personal', 'staff'],
    response: 'En el Plan Free tienes 1 usuario. Con el **Plan Pro** puedes agregar **múltiples usuarios**: directora, secretaria, profesoras... cada una con su propio acceso. 👩‍🏫'
  },
  // Instalación
  {
    keywords: ['instalar', 'instalación', 'descargar', 'app', 'aplicación', 'aplicacion', 'celular', 'computadora'],
    response: 'No necesitas instalar nada. EduNido funciona **100% desde el navegador** de tu celular, tablet o computadora. Solo abre el link y listo. 🌐'
  },
  // Gracias / despedida
  {
    keywords: ['gracias', 'muchas gracias', 'genial', 'excelente', 'perfecto', 'entendido', 'ok', 'vale', 'bueno'],
    response: '¡Con gusto! Si tienes más preguntas no dudes en escribirme. Recuerda que puedes **empezar gratis hoy mismo**. ¡Tu nido merece funcionar sin caos! 🌿💚'
  },
  {
    keywords: ['chau', 'adiós', 'adios', 'bye', 'nos vemos', 'hasta luego'],
    response: '¡Hasta pronto! Recuerda que puedes volver cuando quieras. ¡Estoy aquí 24/7 para ayudarte! 🌿👋'
  },
  // Qué es / qué hace
  {
    keywords: ['qué es', 'que es', 'qué hace', 'que hace', 'para qué sirve', 'para que sirve', 'edunido'],
    response: '**EduNido** es un sistema SaaS que digitaliza la gestión de nidos y jardines de infancia. Maneja **matrículas, pagos y horarios** desde tu navegador, sin complicaciones. ¡Ya hay directoras en Cusco usándolo! 🌿'
  },
  // Quién eres / Nina
  {
    keywords: ['quién eres', 'quien eres', 'nina', 'tu nombre', 'eres real', 'robot', 'bot', 'inteligencia artificial', 'ia'],
    response: 'Soy **Nina** 🌿, la asistente virtual de EduNido. Estoy aquí para resolver tus dudas sobre nuestro sistema de gestión para nidos. ¿En qué te puedo ayudar?'
  },
  // Testimonios / referencias
  {
    keywords: ['testimonio', 'opiniones', 'recomendaciones', 'funciona bien', 'referencias', 'otras directoras'],
    response: 'Directoras como Carmen Mamani de Nido Los Girasoles dicen: "Ahora veo todo en la pantalla y mando recibos por WhatsApp al instante". ¡Las directoras de Cusco ya confían en EduNido! ⭐⭐⭐⭐⭐'
  },
  // Contrato / permanencia
  {
    keywords: ['contrato', 'permanencia', 'cancelar', 'baja', 'desuscribir'],
    response: '**Sin contratos ni permanencia**. En el Plan Pro pagas mes a mes y puedes cancelar cuando quieras. Y el Plan Free es gratis para siempre. ¡Sin riesgo alguno! ✅'
  }
];

// Respuesta cuando no se encuentra match (Fallback sin API)
const FALLBACK_RESPONSES = [
  '¡Qué buena pregunta! Te cuento: EduNido digitaliza matrículas, pagos y horarios para nidos en Cusco. **Empieza gratis** y pruébalo tú misma. ¿Te gustaría saber más sobre alguna función? 🌿',
  'Entiendo tu consulta. EduNido simplifica la gestión de tu nido con un sistema fácil desde el navegador. ¿Te gustaría que te explique sobre nuestros **planes** o alguna función específica? 😊',
  'Gracias por tu interés en EduNido. Podemos ayudarte con matrículas, pagos y horarios, todo digital y sin complicaciones. ¿Qué te parece si **pruebas gratis** el sistema? 🚀',
  'EduNido es la solución perfecta para tu nido. Funciona desde WhatsApp y el navegador, sin instalaciones. ¿Quieres saber sobre el **Plan Free (S/0)** o el **Plan Pro (S/50/mes)**? 💚'
];

// System Prompts
const SYSTEM_PROMPT = `Eres Nina, la asistente virtual de EduNido, un sistema SaaS de gestión académica freemium diseñado específicamente para jardines de infancia (nidos) en Cusco, Perú.
Tu objetivo es VENDER el producto de forma amigable, empática y directa. Responde SIEMPRE en español, de manera conversacional y cálida.
INFORMACIÓN:
- Digitaliza matrículas, pagos y horarios. Sin instalaciones.
- Plan Free: S/0, 30 alumnos.
- Plan Pro: S/50/mes, ilimitado.
Responde de forma MUY breve (2 oraciones máximo) y lleva siempre al usuario a probar gratis o agendar demo.`;
