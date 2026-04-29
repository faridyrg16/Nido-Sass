let conversationHistory = [];

//Enviar Mensaje
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
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

//Res puestas pre guardadas
async function getBotResponse(userMsg) {
  // 1. Revisar respuestas pre-cargadas primero
  const lowerMsg = userMsg.toLowerCase();
  if (typeof PREDEFINED_RESPONSES !== 'undefined') {
    for (const item of PREDEFINED_RESPONSES) {
      if (item.keywords.some(kw => lowerMsg.includes(kw))) {
        showTyping();
        await new Promise(r => setTimeout(r, 600));

        removeTyping();
        conversationHistory.push({ role: 'user', content: userMsg });
        conversationHistory.push({ role: 'assistant', content: item.response });

        const formatted = item.response
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');
        appendMessage(formatted, 'bot');
        return;
      }
    }
  }

  conversationHistory.push({ role: 'user', content: userMsg });
  showTyping();

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory
    ];

    const body = {
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 250,
      temperature: 0.7
    };

    const res = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      removeTyping();
      conversationHistory.pop();
      if (res.status === 429) {
        appendMessage('Recibí demasiadas preguntas seguidas 😅 Espera unos segundos e intenta de nuevo.', 'bot');
      } else if (res.status === 401) {
        appendMessage('Hay un problema con la llave de acceso (API Key). Por favor revisa la configuración.', 'bot');
      } else {
        appendMessage(`Error del servidor (${res.status}). Intenta de nuevo en unos momentos.`, 'bot');
      }
      console.error(`OpenAI HTTP error ${res.status}:`, await res.text());
      return;
    }

    const data = await res.json();

    let botText = 'Lo siento, hubo un error. Por favor intenta de nuevo.';
    if (data.choices && data.choices.length > 0) {
      botText = data.choices[0].message.content;
    } else {
      console.error('OpenAI error:', data);
      conversationHistory.pop();
    }

    conversationHistory.push({ role: 'assistant', content: botText });
    removeTyping();
    const formatted = botText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    appendMessage(formatted, 'bot');

  } catch (err) {
    console.error('Error de red:', err);
    removeTyping();
    conversationHistory.pop();
    appendMessage('Sin conexión a internet. Verifica tu red e intenta de nuevo. 🌐', 'bot');
  }
}

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(26,58,42,0.95)',
    color: '#fff',
    padding: '0.7rem 1.5rem',
    borderRadius: '100px',
    fontSize: '0.85rem',
    zIndex: '9999',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    animation: 'fadeUp 0.3s ease'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
