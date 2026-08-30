const playBtn = document.getElementById("playBtn");
const song = document.getElementById("song");

const welcomeScreen =
  document.getElementById("welcomeScreen");

const experience =
  document.getElementById("experience");

const finalSection =
  document.getElementById("finalSection");

const letterParagraphs = [
  ...document.querySelectorAll(".letter-paragraph")
];

const readingHint =
  document.getElementById("readingHint");

const yesButton =
  document.getElementById("yesButton");

const hugButton =
  document.getElementById("hugButton");


/* =========================================
   CONFIGURACIÓN
========================================= */

/*
 * Velocidad aproximada de lectura.
 * 190 palabras/minuto es un ritmo natural.
 */
const WORDS_PER_MINUTE = 190;

/*
 * Tiempo extra para que no se sienta apresurado.
 */
const EXTRA_READING_TIME = 2500;

/*
 * Nunca avanzará demasiado rápido aunque
 * el párrafo sea muy corto.
 */
const MIN_PARAGRAPH_TIME = 4500;

/*
 * Después de terminar el último párrafo,
 * esperamos un poco antes de comenzar.
 */
const BEFORE_SCROLL_DELAY = 3500;

/*
 * Duración del desplazamiento automático.
 */
const AUTO_SCROLL_DURATION = 5500;


/* =========================================
   ESTADO
========================================= */

let started = false;

let userScrolled = false;

let autoScrolling = false;


/* =========================================
   UTILIDADES
========================================= */

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


/* =========================================
   INICIAR
========================================= */

playBtn.addEventListener("click", async () => {

  if (started) {
    return;
  }

  started = true;

  playBtn.disabled = true;


  /*
   * Como la reproducción comienza después de
   * un toque/click, funciona mucho mejor en móvil.
   */

  try {
    song.currentTime = 0;

    await song.play();

  } catch (error) {

    console.warn(
      "No se pudo iniciar la canción:",
      error
    );
  }


  welcomeScreen.classList.add("hidden");

  experience.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  await revealLetter();
});


/* =========================================
   REVELAR CARTA
========================================= */

async function revealLetter() {

  letterParagraphs.forEach(paragraph => {
    paragraph.classList.remove("visible");
  });


  for (
    let i = 0;
    i < letterParagraphs.length;
    i++
  ) {

    const paragraph =
      letterParagraphs[i];


    /*
     * Calculamos aproximadamente cuánto
     * tardaría en leer este párrafo.
     */

    const words =
      paragraph.textContent
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;


    const calculatedTime =
      (words / WORDS_PER_MINUTE) * 60000;


    const readingTime =
      Math.max(
        MIN_PARAGRAPH_TIME,
        calculatedTime + EXTRA_READING_TIME
      );


    paragraph.classList.add("visible");


    createHeartBurst(
      window.innerWidth * (
        0.35 +
        Math.random() * 0.3
      ),
      window.innerHeight * (
        0.25 +
        Math.random() * 0.35
      ),
      i === letterParagraphs.length - 1
        ? 8
        : 2
    );


    /*
     * Si ella ya empezó a deslizar manualmente,
     * dejamos de controlar el ritmo.
     */

    if (userScrolled) {
      await wait(300);
    } else {
      await wait(readingTime);
    }
  }


  readingHint.classList.remove("hidden");


  /*
   * Si ella decidió deslizar manualmente,
   * no hacemos absolutamente ningún auto-scroll.
   */

  if (userScrolled) {
    return;
  }


  await wait(BEFORE_SCROLL_DELAY);


  if (userScrolled) {
    return;
  }


  autoScrollToQuestion();
}


/* =========================================
   AUTO SCROLL
========================================= */

function autoScrollToQuestion() {

  if (userScrolled) {
    return;
  }


  autoScrolling = true;


  const startPosition =
    window.scrollY;


  const question =
    document.getElementById(
      "questionSection"
    );


  const targetPosition =
    question.getBoundingClientRect().top +
    window.scrollY -
    20;


  const distance =
    targetPosition - startPosition;


  const startTime =
    performance.now();


  function animate(currentTime) {

    /*
     * Si ella desliza, paramos inmediatamente.
     */

    if (userScrolled) {

      autoScrolling = false;

      return;
    }


    const elapsed =
      currentTime - startTime;


    const progress =
      Math.min(
        elapsed / AUTO_SCROLL_DURATION,
        1
      );


    /*
     * Curva suave:
     *
     * lento -> rápido -> lento
     */

    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 -
          Math.pow(
            -2 * progress + 2,
            2
          ) / 2;


    window.scrollTo(
      0,
      startPosition +
      distance * eased
    );


    if (progress < 1) {

      requestAnimationFrame(
        animate
      );

    } else {

      autoScrolling = false;
    }
  }


  requestAnimationFrame(animate);
}


/* =========================================
   DETECTAR SCROLL MANUAL
========================================= */

/*
 * IMPORTANTE:
 *
 * No usamos "scroll" porque el propio
 * auto-scroll también dispara ese evento.
 *
 * Usamos touchstart/touchmove/wheel,
 * que sí indican intención del usuario.
 */

function cancelAutomaticScroll() {

  if (!autoScrolling) {
    return;
  }

  userScrolled = true;
}


window.addEventListener(
  "touchstart",
  cancelAutomaticScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "touchmove",
  cancelAutomaticScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "wheel",
  cancelAutomaticScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "keydown",
  event => {

    const scrollKeys = [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " "
    ];


    if (
      scrollKeys.includes(event.key)
    ) {
      userScrolled = true;
    }
  }
);


/* =========================================
   BOTÓN "SÍ"
========================================= */

yesButton.addEventListener(
  "click",
  acceptProposal
);


hugButton.addEventListener(
  "click",
  acceptProposal
);


async function acceptProposal() {

  yesButton.disabled = true;

  hugButton.disabled = true;


  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight * 0.45,
    30
  );


  await wait(500);


  experience.classList.add("hidden");

  finalSection.classList.remove("hidden");


  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  /*
   * Otra explosión de corazones cuando aparece
   * la pantalla final.
   */

  await wait(500);


  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight * 0.4,
    40
  );


  try {

    localStorage.setItem(
      "forVv_answer",
      "yes"
    );

  } catch (error) {

    console.warn(
      "No se pudo guardar la respuesta."
    );
  }
}


/* =========================================
   CORAZONES
========================================= */

function createHeartBurst(
  x,
  y,
  amount = 15
) {

  const symbols = [
    "♡",
    "♥",
    "♡",
    "♡"
  ];


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const heart =
      document.createElement("span");


    heart.className =
      "heart-particle";


    heart.textContent =
      symbols[
        Math.floor(
          Math.random() *
          symbols.length
        )
      ];


    const angle =
      Math.random() *
      Math.PI *
      2;


    const distance =
      70 +
      Math.random() * 170;


    const vx =
      Math.cos(angle) *
      distance;


    const vy =
      Math.sin(angle) *
      distance;


    const size =
      0.8 +
      Math.random() * 1.2;


    const rotation =
      -40 +
      Math.random() * 80;


    heart.style.setProperty(
      "--x",
      `${x}px`
    );


    heart.style.setProperty(
      "--y",
      `${y}px`
    );


    heart.style.setProperty(
      "--vx",
      `${vx}px`
    );


    heart.style.setProperty(
      "--vy",
      `${vy}px`
    );


    heart.style.setProperty(
      "--size",
      `${size}rem`
    );


    heart.style.setProperty(
      "--rotation",
      `${rotation}deg`
    );


    document.body.appendChild(
      heart
    );


    setTimeout(() => {
      heart.remove();
    }, 1900);
  }
}


/* =========================================
   ERROR DE AUDIO
========================================= */

song.addEventListener(
  "error",
  () => {

    console.warn(
      "No se pudo cargar la canción. " +
      "Verifica que exista: " +
      "assets/Miranda - Perfecta (letra).mp3"
    );

  }
);
