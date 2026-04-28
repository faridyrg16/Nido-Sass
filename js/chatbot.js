// ─── ESTADO DE LA CONVERSACIÓN ────────────────────────────────────────────────
let conversationHistory = [];

// ─── ENVIAR MENSAJE (texto) ───────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if (!msg) return;

  input.value = '';
  hideMicHintAndSuggestions();
  appendMessage(msg, 'user');
  await getBotResponse(msg);
}

function sendSuggestion(btn) {
  const msg = btn.textContent;
  hideMicHintAndSuggestions();
  appendMessage(msg, 'user');
  getBotResponse(msg);
}

function hideMicHintAndSuggestions() {
  const hint = document.getElementById('micHint');
  const sugg = document.getElementById('chatSuggestions');
  if (hint) hint.style.display = 'none';
  if (sugg) sugg.style.display = 'none';
}

// ─── LLAMADA A GEMINI API ─────────────────────────────────────────────────────
async function getBotResponse(userMsg) {
  conversationHistory.push({ role: 'user', parts: [{ text: userMsg }] });
  showTyping();

  try {
    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory,
      generationConfig: { maxOutputTokens: 512, temperature: 0.8 }
    };

    const res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });

    // ── Manejo de errores HTTP ────────────────────────────────────────────────
    if (!res.ok) {
      removeTyping();
      // Elimina el mensaje del usuario del historial para no contaminar el contexto
      conversationHistory.pop();

      if (res.status === 429) {
        appendMessage('Recibí demasiadas preguntas seguidas 😅 Espera unos segundos e intenta de nuevo — estoy lista para ayudarte.', 'bot');
      } else if (res.status === 400) {
        appendMessage('Ocurrió un error con el formato del mensaje. Intenta escribir tu pregunta de otra forma.', 'bot');
      } else if (res.status === 403) {
        appendMessage('Hay un problema de autorización con el servicio. Por favor contáctanos por WhatsApp. 😊', 'bot');
      } else {
        appendMessage(`Error del servidor (${res.status}). Intenta de nuevo en unos momentos.`, 'bot');
      }
      console.error(`Gemini HTTP error ${res.status}:`, await res.text());
      return;
    }

    const data = await res.json();

    let botText = 'Lo siento, hubo un error. Por favor intenta de nuevo.';
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      botText = data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      console.error('Gemini error:', data.error);
      conversationHistory.pop(); // limpiar mensaje fallido del historial
    }

    conversationHistory.push({ role: 'model', parts: [{ text: botText }] });
    removeTyping();

    // Renderiza negritas y saltos de línea
    const formatted = botText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    appendMessage(formatted, 'bot');

  } catch (err) {
    console.error('Error de red:', err);
    removeTyping();
    conversationHistory.pop(); // limpiar mensaje fallido del historial
    appendMessage('Sin conexión a internet. Verifica tu red e intenta de nuevo. 🌐', 'bot');
  }
}

// ─── HELPERS DEL CHAT (DOM) ───────────────────────────────────────────────────
function appendMessage(text, role) {
  const container = document.getElementById('chatMessages');
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; flex-direction:column;';

  if (role === 'user') {
    wrap.style.alignItems = 'flex-end';
    wrap.innerHTML = `
      <div class="msg-label msg-label-right">Tú</div>
      <div class="msg msg-user">${escapeHtml(text)}</div>`;
  } else {
    wrap.innerHTML = `
      <div class="msg-label">Nina 🌿</div>
      <div class="msg msg-bot">${text}</div>`;
  }

  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
  return wrap;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.id = 'typingIndicator';
  el.innerHTML = `
    <div class="msg-label">Nina 🌿</div>
    <div class="typing">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function escapeHtml(text) {
  return text
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:    'fixed',
    bottom:      '2rem',
    left:        '50%',
    transform:   'translateX(-50%)',
    background:  'rgba(26,58,42,0.95)',
    color:       '#fff',
    padding:     '0.7rem 1.5rem',
    borderRadius:'100px',
    fontSize:    '0.85rem',
    zIndex:      '9999',
    fontFamily:  "'DM Sans', sans-serif",
    boxShadow:   '0 8px 24px rgba(0,0,0,0.2)',
    animation:   'fadeUp 0.3s ease'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
