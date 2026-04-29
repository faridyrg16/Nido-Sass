
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];


async function toggleVoice() {
  if (isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    const micBtn = document.getElementById('micBtn');


    micBtn.classList.add('recording');
    micBtn.title = 'Escuchando... (clic para enviar)';
    isRecording = true;
    showListeningBadge();


    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };


    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });


      stream.getTracks().forEach(track => track.stop());

      removeListeningBadge();
      micBtn.classList.remove('recording');
      micBtn.title = 'Hablar con Nina';
      isRecording = false;

      await transcribeAudio(audioBlob);
    };

    mediaRecorder.start();
  } catch (err) {
    console.error('Error accediendo al micrófono:', err);
    showToast('Permite el acceso al micrófono en tu navegador.');
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
}

// ─── TRANSCRIBIR AUDIO CON OPENAI WHISPER ─────────────────────────────────────
async function transcribeAudio(audioBlob) {
  showTyping();

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    const res = await fetch(OPENAI_AUDIO_URL, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      removeTyping();
      console.error('Error Whisper:', await res.text());
      showToast('Error al transcribir. Intenta escribir tu mensaje.');
      return;
    }

    const data = await res.json();
    const transcript = data.text.trim();

    removeTyping();

    if (transcript) {
      appendMessage(transcript, 'user');
      await getBotResponse(transcript);
    } else {
      showToast('No se escuchó nada, intenta de nuevo.');
    }

  } catch (err) {
    console.error('Error transcribiendo:', err);
    removeTyping();
    showToast('Error al transcribir. Intenta escribir tu mensaje.');
  }
}



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
