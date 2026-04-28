// ─── ESTADO DEL MICRÓFONO ─────────────────────────────────────────────────────
let isRecording = false;
let recognition = null;

// ─── TOGGLE: iniciar o detener grabación ──────────────────────────────────────
function toggleVoice() {
  const hasAPI = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  if (!hasAPI) {
    showToast('Tu navegador no soporta voz. Usa Chrome o Edge.');
    return;
  }
  isRecording ? stopRecording() : startRecording();
}

// ─── INICIAR GRABACIÓN ────────────────────────────────────────────────────────
function startRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  // Configuración para español peruano
  recognition.lang            = 'es-PE';
  recognition.interimResults  = true;   // muestra texto mientras hablas
  recognition.continuous      = false;  // para automáticamente al silencio
  recognition.maxAlternatives = 1;

  const micBtn = document.getElementById('micBtn');
  const input  = document.getElementById('chatInput');

  // UI: estado "grabando"
  micBtn.classList.add('recording');
  micBtn.title = 'Hablando... (clic para detener)';
  isRecording  = true;
  showListeningBadge();

  // Resultado de voz → texto
  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript; // mostrar transcripción en tiempo real

    // Cuando el resultado es final → enviar automáticamente
    if (event.results[event.results.length - 1].isFinal) {
      stopRecording();
      const msg = transcript.trim();
      if (msg) {
        input.value = '';
        removeListeningBadge();
        appendMessage(msg, 'user');
        getBotResponse(msg);
      }
    }
  };

  // Manejo de errores
  recognition.onerror = (event) => {
    stopRecording();
    removeListeningBadge();
    if (event.error === 'not-allowed') {
      showToast('Permite el acceso al micrófono en tu navegador.');
    } else if (event.error !== 'no-speech') {
      showToast('No se entendió. Intenta hablar más despacio.');
    }
  };

  // Al terminar (por silencio o error)
  recognition.onend = () => {
    if (isRecording) stopRecording();
    removeListeningBadge();
  };

  recognition.start();
}

// ─── DETENER GRABACIÓN ────────────────────────────────────────────────────────
function stopRecording() {
  isRecording = false;
  const micBtn = document.getElementById('micBtn');
  micBtn.classList.remove('recording');
  micBtn.title = 'Hablar con Nina';

  if (recognition) {
    try { recognition.stop(); } catch (e) { /* ignorar si ya paró */ }
    recognition = null;
  }
}

// ─── BADGE "ESCUCHANDO..." EN EL CHAT ────────────────────────────────────────
function showListeningBadge() {
  removeListeningBadge();
  const container = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.id = 'listeningBadge';
  el.style.cssText = 'display:flex; flex-direction:column; align-items:flex-end;';
  el.innerHTML = `
    <div class="msg-label msg-label-right">Tú</div>
    <div class="voice-badge">Escuchando...</div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function removeListeningBadge() {
  const el = document.getElementById('listeningBadge');
  if (el) el.remove();
}
