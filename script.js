const playBtn = document.getElementById('playBtn');
const song = document.getElementById('song');
const welcomeScreen = document.getElementById('welcomeScreen');
const experience = document.getElementById('experience');
const typewriter = document.getElementById('typewriterText');
const finalSection = document.getElementById('finalSection');
const letterPaper = document.querySelector('.letter-paper');
const downloadLogBtn = document.getElementById('downloadLogBtn');

// Imágenes disponibles
const images = [
  'assets/descarga.png',
  'assets/descarga1.jpg',
  'assets/descarga2.jpg',
  'assets/descarga3.jpg',
  'assets/images4.jpg'
];

const messages = [
  { time: 3,   text: "Tan pronto yo te vi" },
  { time: 5,   text: "No pude descubrir" },
  { time: 7,   text: "El amor a primera vista no funciona en mí" },
  { time: 11,  text: "Después de amarte comprendí" },
  { time: 14,  text: "Que no estaría tan mal" },
  { time: 15,  text: "Probar tu otra mitad" },
  { time: 18,  text: "No me importó si arruinaríamos nuestra amistad" },
  { time: 21,  text: "No me importó y ya qué más da" },
  { time: 24,  text: "Éramos tan buenos amigos hasta hoy" },
  { time: 27,  text: "Que yo probé tu desempeño en el amor" },
  { time: 30,  text: "Me aproveché de que habíamos tomado tanto" },
  { time: 33,  text: "Te fuiste dejando y te agarré" },
  { time: 35,  text: "A pesar de saber que estaba todo mal" },
  { time: 38,  text: "Lo continuamos hasta juntos terminar" },
  { time: 40,  text: "Cuando caímos en lo que estaba pasando" },
  { time: 43,  text: "Te seguí besando y fue..." },
  { time: 45,  text: "Solo tú, no necesito más" },
  { time: 47,  text: "Te adoraría lo que dure la eternidad" },
  { time: 51,  text: "Debes ser perfecta para, perfecto para" },
  { time: 54,  text: "Perfecta para mí, mi amor" },
  { time: 58,  text: "¿Cómo fue que de papel cambié?" },
  { time: 60,  text: "Eras mi amiga y ahora eres mi mujer" },
  { time: 64,  text: "Debes ser perfectamente, exactamente" },
  { time: 67,  text: "Lo que yo siempre soñé" },
  { time: 74,  text: "El tiempo que pasó" },
  { time: 76,  text: "Resultó aún mejor" },
  { time: 79,  text: "Nos conocíamos de antes y sabíamos" },
  { time: 81,  text: "Lo que queríamos los dos" },
  { time: 84,  text: "Entonces el amor" },
  { time: 88,  text: "Nos tiene de rehén" },
  { time: 90,  text: "Seré tu eterna enamorada y te aseguro que" },
  { time: 93,  text: "Todas las noches te amaré" },
  { time: 96,  text: "Éramos tan buenos amigos hasta hoy" },
  { time: 117, text: "Solo tú, no necesito más" },
  { time: 144, text: "Solo tú, no necesito más" },
  { time: 147, text: "Te adoraría lo que dure la eternidad" },
  { time: 150, text: "Debes ser perfecta para, perfecto para" },
  { time: 154, text: "Perfecta para mí, mi amor" },
  { time: 157, text: "¿Cómo fue que de papel cambié?" },
  { time: 160, text: "Eras mi amiga y ahora eres mi mujer" },
  { time: 163, text: "Debes ser perfectamente, exactamente" },
  { time: 167, text: "Lo que yo siempre soñé" }
];

// Sin offset: los tiempos del array ya están ajustados a la canción
const lyricOffset = 0;

// Activa esto para imprimir tiempos de depuración en la consola.
const debugLyrics = true;
let lyricDebugInterval = null;
const lyricDebugLog = [];

function formatTime(seconds) {
  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  const millis = Math.floor((total % 1) * 1000);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function logLyricCueSheet() {
  console.table(
    messages.map((message, index) => ({
      index: index + 1,
      time: formatTime(message.time),
      text: message.text,
    }))
  );
}

function startLyricDebugProbe() {
  if (!debugLyrics || lyricDebugInterval) return;

  lyricDebugLog.length = 0;
  console.clear();
  logLyricCueSheet();
  console.info('[lyrics] Debug activo. Reproduce la canción y mira la consola.');

  lyricDebugInterval = setInterval(() => {
    if (song.paused || song.ended) return;

    const adjustedTime = song.currentTime + lyricOffset;
    const upcoming = messages.find((message) => message.time >= adjustedTime) || messages[messages.length - 1];
    const previous = [...messages].reverse().find((message) => message.time <= adjustedTime);

    console.log('[lyrics]', {
      current: formatTime(adjustedTime),
      previous: previous ? `${formatTime(previous.time)} - ${previous.text}` : null,
      next: upcoming ? `${formatTime(upcoming.time)} - ${upcoming.text}` : null,
    });

    lyricDebugLog.push(
      `[${formatTime(adjustedTime)}] prev=${previous ? previous.text : 'null'} | next=${upcoming ? upcoming.text : 'null'}`
    );
  }, 250);
}

function stopLyricDebugProbe() {
  if (lyricDebugInterval) {
    clearInterval(lyricDebugInterval);
    lyricDebugInterval = null;
  }
}

function downloadLyricLog() {
  if (!debugLyrics) return;

  const lines = [
    'Miranda! - Perfecta debug log',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Cue sheet:',
    ...messages.map((message, index) => `${String(index + 1).padStart(2, '0')}. ${formatTime(message.time)} | ${message.text}`),
    '',
    'Playback log:',
    ...lyricDebugLog,
    ''
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `miranda-perfecta-debug-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

if (downloadLogBtn) {
  downloadLogBtn.addEventListener('click', () => {
    if (!song.paused && !song.ended) {
      console.info('[lyrics] Descargando log actual en medio de la reproducción.');
    }
    downloadLyricLog();
  });
}

// ── BOTÓN REPRODUCIR ──────────────────────────────────────────
playBtn.addEventListener('click', async () => {
  typewriter.innerHTML = '';
  shownMessages = [];

  // 1. Mostrar imagen gigante romántica antes de la transición
  showBigImageReveal(() => {
    // 2. Transición de pantalla
    welcomeScreen.classList.add('hidden');
    experience.classList.remove('hidden');

    // 3. Reproducir canción
    song.play().catch(() => {});

    // 3.1. Trazado de tiempos en consola para ajustar la sincronización
    startLyricDebugProbe();

    // 4. Fuegos artificiales al arrancar
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createHeartFireworks(), i * 300);
    }

    // 5. Imágenes flotantes periódicas
    scheduleFloatingImages();
  });
});

// ── IMAGEN GIGANTE AL INICIO ──────────────────────────────────
function showBigImageReveal(onDone) {
  const randomImg = images[Math.floor(Math.random() * images.length)];

  const overlay = document.createElement('div');
  overlay.className = 'big-reveal-overlay';

  const imgEl = document.createElement('img');
  imgEl.src = randomImg;
  imgEl.className = 'big-reveal-img';
  imgEl.alt = '';

  const heart = document.createElement('div');
  heart.className = 'big-reveal-heart';
  heart.textContent = '💖';

  overlay.appendChild(imgEl);
  overlay.appendChild(heart);
  document.body.appendChild(overlay);

  // Fuegos mientras aparece la imagen
  setTimeout(() => createHeartFireworks(), 100);
  setTimeout(() => createHeartFireworks(), 400);

  // Desaparecer después de 2.2s y continuar
  setTimeout(() => {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
      onDone();
    }, 600);
  }, 2200);
}

// ── SINCRONIZACIÓN DE LETRA ───────────────────────────────────
let shownMessages = [];

song.addEventListener('timeupdate', () => {
  const adjustedTime = song.currentTime + lyricOffset;

  messages.forEach((message, index) => {
    if (adjustedTime >= message.time && !shownMessages.includes(index)) {
      shownMessages.push(index);
      typeText(message.text);
      createHeartFireworks();
      animateLetter();

      // Más fuegos en momentos especiales
      if (index % 4 === 0) {
        setTimeout(() => createHeartFireworks(), 250);
      }
    }
  });
});

// ── EFECTO TYPEWRITER ─────────────────────────────────────────
function typeText(text) {
  const p = document.createElement('p');
  p.className = 'lyric-line';
  p.textContent = text;
  typewriter.appendChild(p);

  // Auto-scroll suave al final
  typewriter.scrollTop = typewriter.scrollHeight;
}

// ── FUEGOS ARTIFICIALES DE CORAZONES ─────────────────────────
function createHeartFireworks() {
  const heartCount = 18;
  const colors = ['♡', '♥', '💖', '💕', '💗', '💞', '💓', '💘'];

  // Posición aleatoria en la pantalla (no siempre el centro)
  const originX = window.innerWidth  * (0.2 + Math.random() * 0.6);
  const originY = window.innerHeight * (0.2 + Math.random() * 0.6);

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.textContent = colors[Math.floor(Math.random() * colors.length)];

    const angle    = (i / heartCount) * Math.PI * 2;
    const velocity = 4 + Math.random() * 5;
    const size     = 1.2 + Math.random() * 1.8;
    const vx       = Math.cos(angle) * velocity * 90;
    const vy       = Math.sin(angle) * velocity * 90;

    heart.style.setProperty('--vx', vx + 'px');
    heart.style.setProperty('--vy', vy + 'px');
    heart.style.fontSize = size + 'rem';
    // Usar position fixed directamente en el body
    heart.style.position = 'fixed';
    heart.style.left = originX + 'px';
    heart.style.top  = originY + 'px';
    heart.style.zIndex = '99999';
    heart.style.pointerEvents = 'none';

    document.body.appendChild(heart);

    // Limpiar después de la animación
    setTimeout(() => heart.remove(), 2100);
  }
}

// ── ANIMAR CARTA ──────────────────────────────────────────────
function animateLetter() {
  if (!letterPaper) return;
  letterPaper.classList.add('letter-beat');
  setTimeout(() => letterPaper.classList.remove('letter-beat'), 500);
}

// ── IMÁGENES FLOTANTES PERIÓDICAS ─────────────────────────────
function scheduleFloatingImages() {
  // Primera tanda inmediata
  spawnFloatingImages(4);

  // Cada 18 segundos aparecen más mientras suena la canción
  const intervalId = setInterval(() => {
    if (song.paused || song.ended) {
      clearInterval(intervalId);
      return;
    }
    spawnFloatingImages(2 + Math.floor(Math.random() * 3));
  }, 18000);
}

function spawnFloatingImages(count) {
  const container = document.querySelector('.experience');
  if (!container) return;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'floating-image-wrapper';

      const img = document.createElement('img');
      img.src = images[Math.floor(Math.random() * images.length)];
      img.alt = '';

      const randomLeft     = Math.random() * 88 + 6; // 6%–94%
      const randomDelay    = Math.random() * 1.5;
      const randomDuration = 10 + Math.random() * 6;

      imgWrapper.style.setProperty('--left',     randomLeft + '%');
      imgWrapper.style.setProperty('--delay',    randomDelay + 's');
      imgWrapper.style.setProperty('--duration', randomDuration + 's');

      imgWrapper.appendChild(img);
      container.appendChild(imgWrapper);

      const totalMs = (randomDelay + randomDuration) * 1000;
      setTimeout(() => imgWrapper.remove(), totalMs + 100);
    }, i * 700);
  }
}

// ── FINAL ─────────────────────────────────────────────────────
song.addEventListener('ended', () => {
  stopLyricDebugProbe();
  downloadLyricLog();
  experience.classList.add('hidden');
  finalSection.classList.remove('hidden');
  // Pequeña celebración al final
  for (let i = 0; i < 5; i++) {
    setTimeout(() => createHeartFireworks(), i * 200);
  }
});

song.addEventListener('pause', () => {
  if (!song.ended) {
    stopLyricDebugProbe();
  }
});
