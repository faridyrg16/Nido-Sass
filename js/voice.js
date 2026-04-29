// ESTADO DEL MICRÓFONO
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// iniciar o detener grabación
async function toggleVoice() {
  if (isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

// INICIAR GRABACIÓN 
async function startRecording() {
  try {
    // Pedir permisos y obtener el flujo de audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    const micBtn = document.getElementById('micBtn');

    // UI: estado "grabando"
    micBtn.classList.add('recording');
    micBtn.title = 'Escuchando... (clic para enviar)';
    isRecording = true;
    showListeningBadge();

    // Guardar los pedazos de audio
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Al detener la grabación
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      // Apagar la luz del micrófono del navegador
      stream.getTracks().forEach(track => track.stop());

      removeListeningBadge();
      micBtn.classList.remove('recording');
      micBtn.title = 'Hablar con Nina';
      isRecording = false;

      // Enviar a Whisper API
      await transcribeAudio(audioBlob);
    };

    mediaRecorder.start();
  } catch (err) {
    console.error('Error accediendo al micrófono:', err);
    showToast('Permite el acceso al micrófono en tu navegador.');
  }
}

// ─── DETENER GRABACIÓN ────────────────────────────────────────────────────────
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop(); // Esto dispara el evento onstop
  }
}

// ─── TRANSCRIBIR AUDIO CON OPENAI WHISPER ─────────────────────────────────────
async function transcribeAudio(audioBlob) {
  showTyping(); // Usamos el typing indicator mientras transcribe

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es'); // Forzamos español

    const res = await fetch(OPENAI_AUDIO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!res.ok) {
      removeTyping();
      console.error('Error Whisper:', await res.text());
      showToast('Error al transcribir el audio.');
      return;
    }

    const data = await res.json();
    const transcript = data.text.trim();

    removeTyping();

    if (transcript) {
      // Enviamos el mensaje transcrito al chat
      appendMessage(transcript, 'user');
      await getBotResponse(transcript);
    } else {
      showToast('No se escuchó nada, intenta de nuevo.');
    }

  } catch (err) {
    console.error('Error de red transcribiendo:', err);
    removeTyping();
    showToast('Error de red al transcribir el audio.');
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
