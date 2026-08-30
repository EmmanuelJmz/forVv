/* ============================================================
   ELEMENTOS
============================================================ */

const startButton = document.getElementById("startButton");
const continueButton = document.getElementById("continueButton");
const questionButton = document.getElementById("questionButton");

const yesButton = document.getElementById("yesButton");
const hugButton = document.getElementById("hugButton");

const song = document.getElementById("song");

const welcomeScreen = document.getElementById("welcomeScreen");
const revealScreen = document.getElementById("revealScreen");
const letterScreen = document.getElementById("letterScreen");
const dreamsScreen = document.getElementById("dreamsScreen");
const questionScreen = document.getElementById("questionScreen");
const finalScreen = document.getElementById("finalScreen");

const transitionOverlay = document.getElementById("transitionOverlay");
const heartContainer = document.getElementById("heartContainer");

const letterParagraphs = [
  ...document.querySelectorAll(".letter-paragraph")
];


/* ============================================================
   CONFIGURACIÓN
============================================================ */

const LETTER_DELAY = 1800;

let currentStep = 0;
let started = false;


/* ============================================================
   UTILIDADES
============================================================ */

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


function showScreen(screen) {
  const screens = [
    welcomeScreen,
    revealScreen,
    letterScreen,
    dreamsScreen,
    questionScreen,
    finalScreen
  ];

  screens.forEach(item => {
    item.classList.add("hidden");
  });

  screen.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function showTransition() {
  transitionOverlay.classList.remove("hidden");
}


function hideTransition() {
  transitionOverlay.classList.add("hidden");
}


/* ============================================================
   INICIO
============================================================ */

startButton.addEventListener("click", async () => {

  if (started) {
    return;
  }

  started = true;

  startButton.disabled = true;

  /*
   * La interacción del usuario permite reproducir
   * audio en navegadores móviles.
   */
  try {
    song.currentTime = 0;
    await song.play();
  } catch (error) {
    console.log("El navegador bloqueó la reproducción automática.", error);
  }

  showTransition();

  await wait(900);

  showScreen(revealScreen);

  await wait(2400);

  showTransition();

  await wait(700);

  showScreen(letterScreen);

  hideTransition();

  revealLetter();
});


/* ============================================================
   REVEAL DE LA CARTA
============================================================ */

async function revealLetter() {

  letterParagraphs.forEach(paragraph => {
    paragraph.classList.remove("visible");
  });

  /*
   * Cada párrafo aparece lentamente.
   * No hay letras de canción ni sincronización complicada:
   * la música simplemente acompaña la experiencia.
   */
  for (let i = 0; i < letterParagraphs.length; i++) {

    await wait(i === 0 ? 500 : LETTER_DELAY);

    letterParagraphs[i].classList.add("visible");

    createHeartBurst(
      window.innerWidth * (0.35 + Math.random() * 0.3),
      window.innerHeight * (0.25 + Math.random() * 0.4),
      i === letterParagraphs.length - 1 ? 10 : 4
    );
  }

  await wait(1200);

  continueButton.classList.remove("hidden");

  continueButton.animate(
    [
      {
        opacity: 0,
        transform: "translateY(10px)"
      },
      {
        opacity: 1,
        transform: "translateY(0)"
      }
    ],
    {
      duration: 700,
      easing: "ease-out",
      fill: "forwards"
    }
  );
}


/* ============================================================
   CARTA → LO QUE QUIERO
============================================================ */

continueButton.addEventListener("click", async () => {

  showTransition();

  await wait(700);

  showScreen(dreamsScreen);

  hideTransition();

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight / 2,
    14
  );
});


/* ============================================================
   LO QUE QUIERO → PREGUNTA
============================================================ */

questionButton.addEventListener("click", async () => {

  showTransition();

  await wait(750);

  showScreen(questionScreen);

  hideTransition();

  await wait(500);

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight * 0.35,
    18
  );
});


/* ============================================================
   RESPUESTA
============================================================ */

yesButton.addEventListener("click", acceptProposal);

hugButton.addEventListener("click", acceptProposal);


async function acceptProposal() {

  yesButton.disabled = true;
  hugButton.disabled = true;

  showTransition();

  await wait(1000);

  showScreen(finalScreen);

  hideTransition();

  /*
   * Gran celebración final.
   */
  setTimeout(() => {
    createHeartBurst(
      window.innerWidth / 2,
      window.innerHeight * 0.42,
      35
    );
  }, 250);

  setTimeout(() => {
    createHeartBurst(
      window.innerWidth * 0.25,
      window.innerHeight * 0.55,
      20
    );
  }, 500);

  setTimeout(() => {
    createHeartBurst(
      window.innerWidth * 0.75,
      window.innerHeight * 0.55,
      20
    );
  }, 750);

  /*
   * Guardamos solamente que llegó al final.
   * No se envía información a ningún servidor.
   */
  try {
    localStorage.setItem(
      "forVv_answer",
      "yes"
    );
  } catch (error) {
    // Algunos navegadores pueden bloquear localStorage.
  }

  /*
   * Dejamos la música sonando.
   */
}


/* ============================================================
   CORAZONES
============================================================ */

function createHeartBurst(x, y, amount = 12) {

  const symbols = [
    "♡",
    "♥",
    "♡",
    "♥",
    "♡"
  ];

  for (let i = 0; i < amount; i++) {

    const heart = document.createElement("span");

    heart.className = "heart-particle";

    heart.textContent =
      symbols[
        Math.floor(Math.random() * symbols.length)
      ];

    const angle =
      Math.random() * Math.PI * 2;

    const distance =
      70 + Math.random() * 180;

    const vx =
      Math.cos(angle) * distance;

    const vy =
      Math.sin(angle) * distance;

    const size =
      0.8 + Math.random() * 1.4;

    const rotation =
      -35 + Math.random() * 70;

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

    heartContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1900);
  }
}


/* ============================================================
   CORAZONES SUAVES EN BACKGROUND
============================================================ */

function createAmbientHeart() {

  const heart = document.createElement("span");

  heart.textContent =
    Math.random() > 0.5 ? "♡" : "·";

  heart.style.position = "fixed";

  heart.style.left =
    `${Math.random() * 100}%`;

  heart.style.bottom = "-30px";

  heart.style.color =
    "rgba(217, 87, 134, 0.18)";

  heart.style.fontSize =
    `${0.7 + Math.random() * 0.8}rem`;

  heart.style.pointerEvents = "none";

  heart.style.zIndex = "2";

  heart.animate(
    [
      {
        transform: "translateY(0) rotate(0deg)",
        opacity: 0
      },
      {
        opacity: 1
      },
      {
        transform:
          `translateY(-110vh) rotate(${20 + Math.random() * 60}deg)`,
        opacity: 0
      }
    ],
    {
      duration:
        9000 + Math.random() * 7000,

      easing: "linear",

      fill: "forwards"
    }
  );

  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 17000);
}


/*
 * Poquitos corazones ambientales.
 * No interfieren con la lectura.
 */
setInterval(createAmbientHeart, 2200);


/* ============================================================
   CONTROL DE AUDIO
============================================================ */

song.addEventListener("ended", () => {

  /*
   * Si la canción termina antes de que llegue a la pregunta,
   * simplemente dejamos la página funcionando.
   *
   * No mostramos automáticamente la propuesta:
   * ella debe avanzar por la experiencia.
   */

  console.log("La canción terminó.");
});


song.addEventListener("error", () => {

  console.warn(
    "No se pudo cargar la canción. Revisa la ruta del archivo."
  );

});


/* ============================================================
   TOUCH / MÓVIL
============================================================ */

document.addEventListener(
  "touchstart",
  () => {},
  {
    passive: true
  }
);


/* ============================================================
   INICIO
============================================================ */

console.log(
  "%c♡ Para ti ♡",
  `
    color: #d95786;
    font-size: 22px;
    font-weight: bold;
  `
);

console.log(
  "La experiencia está lista."
);
