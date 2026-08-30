const playBtn =
  document.getElementById("playBtn");

const song =
  document.getElementById("song");

const welcomeScreen =
  document.getElementById("welcomeScreen");

const experience =
  document.getElementById("experience");

const finalSection =
  document.getElementById("finalSection");

const letterParagraphs = [
  ...document.querySelectorAll(
    ".letter-paragraph"
  )
];

const readingHint =
  document.getElementById(
    "readingHint"
  );

const yesButton =
  document.getElementById(
    "yesButton"
  );

const hugButton =
  document.getElementById(
    "hugButton"
  );


/* =========================================
   CONFIGURACIÓN
========================================= */

/*
 * Velocidad de lectura.
 *
 * La versión anterior utilizaba 190.
 * Ahora utilizamos 380 para que sea
 * aproximadamente el doble de rápida.
 */

const WORDS_PER_MINUTE = 380;


/*
 * Tiempo adicional por párrafo.
 */

const EXTRA_READING_TIME = 1200;


/*
 * Tiempo mínimo por párrafo.
 */

const MIN_PARAGRAPH_TIME = 2200;


/*
 * Tiempo después de terminar la carta
 * antes de iniciar el auto-scroll.
 */

const BEFORE_SCROLL_DELAY = 1800;


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
   UTILIDAD
========================================= */

function wait(ms) {

  return new Promise(
    resolve => {
      setTimeout(
        resolve,
        ms
      );
    }
  );

}


/* =========================================
   INICIAR CARTA
========================================= */

playBtn.addEventListener(
  "click",
  async () => {

    /*
     * Evita iniciar dos veces.
     */

    if (started) {
      return;
    }

    started = true;

    playBtn.disabled = true;


    /*
     * Inicia la canción.
     *
     * Al ocurrir después del click,
     * los navegadores móviles permiten
     * normalmente la reproducción.
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
     * Cambiamos de la portada
     * a la carta.
     */

    welcomeScreen.classList.add(
      "hidden"
    );

    experience.classList.remove(
      "hidden"
    );


    /*
     * Nos aseguramos de empezar
     * arriba de todo.
     */

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });


    /*
     * Comienza la carta.
     */

    await revealLetter();

  }
);


/* =========================================
   MOSTRAR CARTA
========================================= */

async function revealLetter() {

  /*
   * Ocultamos inicialmente todos
   * los párrafos.
   */

  letterParagraphs.forEach(
    paragraph => {

      paragraph.classList.remove(
        "visible"
      );

    }
  );


  /*
   * Recorremos cada párrafo.
   */

  for (
    let i = 0;
    i < letterParagraphs.length;
    i++
  ) {

    const paragraph =
      letterParagraphs[i];


    /*
     * Contamos las palabras.
     */

    const words =
      paragraph.textContent
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;


    /*
     * Calculamos el tiempo
     * aproximado de lectura.
     */

    const calculatedTime =
      (
        words /
        WORDS_PER_MINUTE
      ) * 60000;


    /*
     * Tiempo final.
     *
     * Nunca será menor a 2.2 segundos.
     */

    const readingTime =
      Math.max(
        MIN_PARAGRAPH_TIME,
        calculatedTime +
        EXTRA_READING_TIME
      );


    /*
     * Mostramos el párrafo.
     */

    paragraph.classList.add(
      "visible"
    );


    /*
     * Pequeño efecto de corazones.
     */

    createHeartBurst(

      window.innerWidth *
        (
          0.35 +
          Math.random() * 0.3
        ),

      window.innerHeight *
        (
          0.25 +
          Math.random() * 0.35
        ),

      i ===
        letterParagraphs.length - 1
        ? 8
        : 2

    );


    /*
     * Esperamos el tiempo calculado.
     *
     * Si ella comenzó a deslizar,
     * dejamos de controlar el ritmo.
     */

    if (userScrolled) {

      await wait(300);

    } else {

      await wait(
        readingTime
      );

    }

  }


  /*
   * Terminó la carta.
   */

  readingHint.classList.remove(
    "hidden"
  );


  /*
   * Si ella ya está deslizando,
   * no hacemos auto-scroll.
   */

  if (userScrolled) {
    return;
  }


  /*
   * Pequeña pausa.
   */

  await wait(
    BEFORE_SCROLL_DELAY
  );


  /*
   * Comprobamos otra vez.
   */

  if (userScrolled) {
    return;
  }


  /*
   * Desplazamos hacia la pregunta.
   */

  autoScrollToQuestion();

}


/* =========================================
   AUTO-SCROLL
========================================= */

function autoScrollToQuestion() {

  /*
   * Si ya deslizó manualmente,
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
   * Posición final.
   */

  const targetPosition =
    question.getBoundingClientRect().top +
    window.scrollY -
    20;


  const distance =
    targetPosition -
    startPosition;


  const startTime =
    performance.now();


  function animate(
    currentTime
  ) {

    /*
     * Si toca la pantalla,
     * detenemos inmediatamente.
     */

    if (userScrolled) {

      autoScrolling = false;

      return;
    }


    const elapsed =
      currentTime -
      startTime;


    const progress =
      Math.min(
        elapsed /
          AUTO_SCROLL_DURATION,
        1
      );


    /*
     * Movimiento suave:
     *
     * lento → rápido → lento
     */

    const eased =
      progress < 0.5

        ? 2 *
          progress *
          progress

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
     * Continuamos.
     */

    if (progress < 1) {

      requestAnimationFrame(
        animate
      );

    } else {

      autoScrolling = false;

    }

  }


  requestAnimationFrame(
    animate
  );

}


/* =========================================
   DETECTAR SCROLL MANUAL
========================================= */

/*
 * TOUCHSTART
 *
 * En móvil, si toca la pantalla mientras
 * hacemos auto-scroll, cancelamos.
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
 * TOUCHMOVE
 *
 * Si empieza a arrastrar,
 * el control pasa a ella.
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
 * Para computadora.
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
      scrollKeys.includes(
        event.key
      )
    ) {

      userScrolled = true;

    }

  }
);


/* =========================================
   BOTÓN SÍ
========================================= */

yesButton.addEventListener(
  "click",
  acceptProposal
);


hugButton.addEventListener(
  "click",
  acceptProposal
);


/* =========================================
   ACEPTAR PROPUESTA
========================================= */

async function acceptProposal() {

  /*
   * Evitamos múltiples clicks.
   */

  yesButton.disabled = true;

  hugButton.disabled = true;


  /*
   * Explosión inicial.
   */

  createHeartBurst(

    window.innerWidth / 2,

    window.innerHeight * 0.45,

    30

  );


  await wait(500);


  /*
   * Ocultamos la experiencia.
   */

  experience.classList.add(
    "hidden"
  );


  /*
   * Mostramos el final.
   */

  finalSection.classList.remove(
    "hidden"
  );


  /*
   * Volvemos arriba.
   */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  await wait(500);


  /*
   * Segunda explosión.
   */

  createHeartBurst(

    window.innerWidth / 2,

    window.innerHeight * 0.4,

    40

  );


  /*
   * Guardamos la respuesta.
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


  /*
   * Creamos cada corazón.
   */

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const heart =
      document.createElement(
        "span"
      );


    heart.className =
      "heart-particle";


    /*
     * Símbolo aleatorio.
     */

    heart.textContent =
      symbols[
        Math.floor(
          Math.random() *
          symbols.length
        )
      ];


    /*
     * Dirección aleatoria.
     */

    const angle =
      Math.random() *
      Math.PI *
      2;


    /*
     * Distancia.
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
     * Tamaño.
     */

    const size =
      0.8 +
      Math.random() * 1.2;


    /*
     * Rotación.
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
     * Agregamos al documento.
     */

    document.body.appendChild(
      heart
    );


    /*
     * Eliminamos después
     * de la animación.
     */

    setTimeout(
      () => {

        heart.remove();

      },
      1900
    );

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
