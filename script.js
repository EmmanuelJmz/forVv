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
 * Velocidad de lectura.
 *
 * Antes:
 * 190 palabras/minuto
 *
 * Ahora:
 * 380 palabras/minuto
 *
 * Esto hace que la lectura automática sea
 * aproximadamente el doble de rápida.
 */
const WORDS_PER_MINUTE = 380;


/*
 * Tiempo adicional después de calcular
 * la lectura de cada párrafo.
 */
const EXTRA_READING_TIME = 1200;


/*
 * Tiempo mínimo que permanecerá visible
 * cada párrafo.
 */
const MIN_PARAGRAPH_TIME = 2200;


/*
 * Pausa después de terminar la carta
 * antes de comenzar el auto-scroll.
 */
const BEFORE_SCROLL_DELAY = 1800;


/*
 * Duración del desplazamiento automático
 * hacia la pregunta final.
 */
const AUTO_SCROLL_DURATION = 5500;


/* =========================================
   ESTADO
========================================= */

let started = false;

/*
 * Se vuelve true cuando ella empieza
 * a deslizar manualmente.
 */
let userScrolled = false;

/*
 * Indica si actualmente estamos haciendo
 * auto-scroll.
 */
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
   INICIAR EXPERIENCIA
========================================= */

playBtn.addEventListener("click", async () => {

  if (started) {
    return;
  }

  started = true;

  playBtn.disabled = true;


  /*
   * El navegador permite reproducir audio
   * porque esto ocurre directamente después
   * del toque/click de la persona.
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


  /*
   * Ocultamos la pantalla inicial.
   */

  welcomeScreen.classList.add("hidden");

  experience.classList.remove("hidden");


  /*
   * Regresamos al principio de la carta.
   */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  /*
   * Comenzamos la lectura.
   */

  await revealLetter();

});


/* =========================================
   REVELAR CARTA
========================================= */

async function revealLetter() {

  /*
   * Primero ocultamos todos los párrafos.
   */

  letterParagraphs.forEach(paragraph => {

    paragraph.classList.remove("visible");

  });


  /*
   * Vamos mostrando cada párrafo.
   */

  for (
    let i = 0;
    i < letterParagraphs.length;
    i++
  ) {

    const paragraph =
      letterParagraphs[i];


    /*
     * Contamos aproximadamente cuántas
     * palabras tiene el párrafo.
     */

    const words =
      paragraph.textContent
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;


    /*
     * Calculamos el tiempo de lectura.
     *
     * 380 palabras/minuto hace que avance
     * aproximadamente al doble de velocidad
     * respecto a la versión anterior.
     */

    const calculatedTime =
      (words / WORDS_PER_MINUTE) * 60000;


    /*
     * Agregamos un pequeño margen.
     */

    const readingTime =
      Math.max(
        MIN_PARAGRAPH_TIME,
        calculatedTime + EXTRA_READING_TIME
      );


    /*
     * Mostramos el párrafo.
     */

    paragraph.classList.add("visible");


    /*
     * Pequeño efecto de corazones.
     */

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
     * Esperamos el tiempo calculado.
     *
     * Si ella ya empezó a deslizar,
     * dejamos de imponer el ritmo.
     */

    if (userScrolled) {

      await wait(300);

    } else {

      await wait(readingTime);

    }

  }


  /*
   * Ya terminó la carta.
   */

  readingHint.classList.remove("hidden");


  /*
   * Si ella estuvo deslizando manualmente,
   * no hacemos auto-scroll.
   */

  if (userScrolled) {
    return;
  }


  /*
   * Pequeña pausa antes de llevarla
   * a la pregunta.
   */

  await wait(BEFORE_SCROLL_DELAY);


  /*
   * Volvemos a comprobar por si deslizó
   * durante la espera.
   */

  if (userScrolled) {
    return;
  }


  /*
   * Comenzamos el desplazamiento automático.
   */

  autoScrollToQuestion();

}


/* =========================================
   AUTO SCROLL
========================================= */

function autoScrollToQuestion() {

  /*
   * Seguridad:
   * si ella ya está controlando la página,
   * no hacemos nada.
   */

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


  /*
   * Calculamos dónde está la pregunta.
   */

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
     * Si ella toca/desliza la pantalla,
     * detenemos inmediatamente el movimiento.
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
     * Easing suave:
     *
     * empieza despacio,
     * acelera en medio,
     * termina despacio.
     */

    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 -
          Math.pow(
            -2 * progress + 2,
            2
          ) / 2;


    /*
     * Movemos la página.
     */

    window.scrollTo(
      0,
      startPosition +
      distance * eased
    );


    /*
     * Continuamos hasta llegar al final.
     */

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
   DETECTAR INTERACCIÓN MANUAL
========================================= */

/*
 * No usamos solamente el evento "scroll"
 * porque el auto-scroll también genera
 * eventos de scroll.
 *
 * En cambio detectamos directamente cuando
 * la persona toca o mueve la pantalla.
 */


/*
 * TOUCH START
 *
 * En móvil, apenas toca la pantalla,
 * cancelamos el auto-scroll.
 */

window.addEventListener(
  "touchstart",
  () => {

    if (autoScrolling) {
      userScrolled = true;
    }

  },
  {
    passive: true
  }
);


/*
 * TOUCH MOVE
 *
 * Si empieza a arrastrar la página,
 * el control pasa completamente a ella.
 */

window.addEventListener(
  "touchmove",
  () => {

    if (autoScrolling) {
      userScrolled = true;
    }

  },
  {
    passive: true
  }
);


/*
 * MOUSE WHEEL
 *
 * También funciona si abre la página
 * desde computadora.
 */

window.addEventListener(
  "wheel",
  () => {

    if (autoScrolling) {
      userScrolled = true;
    }

  },
  {
    passive: true
  }
);


/*
 * TECLADO
 *
 * Por si abre la página desde PC.
 */

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


/*
 * El botón de abrazo también lleva
 * al final feliz.
 */

hugButton.addEventListener(
  "click",
  acceptProposal
);


/* =========================================
   ACEPTAR
========================================= */

async function acceptProposal() {

  /*
   * Evitamos múltiples clicks.
   */

  yesButton.disabled = true;

  hugButton.disabled = true;


  /*
   * Primera explosión de corazones.
   */

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight * 0.45,
    30
  );


  await wait(500);


  /*
   * Ocultamos la carta.
   */

  experience.classList.add("hidden");


  /*
   * Mostramos el mensaje final.
   */

  finalSection.classList.remove("hidden");


  /*
   * Regresamos arriba.
   */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  await wait(500);


  /*
   * Segunda explosión de corazones.
   */

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight * 0.4,
    40
  );


  /*
   * Guardamos la respuesta localmente.
   */

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
   CREAR CORAZONES
========================================= */

function createHeartBurst(
  x,
  y,
  amount = 15
) {

  /*
   * Símbolos disponibles.
   */

  const symbols = [
    "♡",
    "♥",
    "♡",
    "♡"
  ];


  /*
   * Creamos varios corazones.
   */

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const heart =
      document.createElement("span");


    heart.className =
      "heart-particle";


    /*
     * Elegimos aleatoriamente
     * el símbolo.
     */

    heart.textContent =
      symbols[
        Math.floor(
          Math.random() *
          symbols.length
        )
      ];


    /*
     * Ángulo aleatorio.
     */

    const angle =
      Math.random() *
      Math.PI *
      2;


    /*
     * Distancia aleatoria.
     */

    const distance =
      70 +
      Math.random() * 170;


    /*
     * Movimiento horizontal.
     */

    const vx =
      Math.cos(angle) *
      distance;


    /*
     * Movimiento vertical.
     */

    const vy =
      Math.sin(angle) *
      distance;


    /*
     * Tamaño aleatorio.
     */

    const size =
      0.8 +
      Math.random() * 1.2;


    /*
     * Rotación aleatoria.
     */

    const rotation =
      -40 +
      Math.random() * 80;


    /*
     * Variables CSS.
     */

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


    /*
     * Lo agregamos al documento.
     */

    document.body.appendChild(
      heart
    );


    /*
     * Lo eliminamos después de
     * terminar la animación.
     */

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
);const playBtn = document.getElementById("playBtn");
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
