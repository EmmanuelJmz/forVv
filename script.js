/* ============================================================
ELEMENTOS
============================================================ */

const startButton =
document.getElementById("startButton");

const questionButton =
document.getElementById("questionButton");

const yesButton =
document.getElementById("yesButton");

const hugButton =
document.getElementById("hugButton");

const song =
document.getElementById("song");

const welcomeScreen =
document.getElementById("welcomeScreen");

const revealScreen =
document.getElementById("revealScreen");

const letterScreen =
document.getElementById("letterScreen");

const dreamsScreen =
document.getElementById("dreamsScreen");

const questionScreen =
document.getElementById("questionScreen");

const finalScreen =
document.getElementById("finalScreen");

const transitionOverlay =
document.getElementById("transitionOverlay");

const heartContainer =
document.getElementById("heartContainer");

const letterParagraphs =
[...document.querySelectorAll(".letter-paragraph")];

const readingComplete =
document.getElementById("readingComplete");

/* ============================================================
CONFIGURACIÓN
============================================================ */

/*

* Velocidad aproximada de lectura:
*
* 190 palabras por minuto.
*
* Le agregamos unos segundos a cada párrafo para que
* la experiencia nunca se sienta apresurada.
  */
  const WORDS_PER_MINUTE = 190;

const EXTRA_READING_TIME = 2200;

const MIN_PARAGRAPH_TIME = 3500;

/*

* Después de terminar el último párrafo esperamos
* un poquito antes de iniciar el desplazamiento.
  */
  const AUTO_SCROLL_DELAY = 2800;

/*

* Velocidad del desplazamiento automático.
* Más alto = más lento.
  */
  const AUTO_SCROLL_DURATION = 3600;

/*

* Una vez que termina el auto-scroll, dejamos un pequeño
* margen antes de considerar que la sección está lista.
  */
  const AUTO_SCROLL_FINISH_DELAY = 1200;

let started = false;

let autoScrollCancelled = false;

let isAutoScrolling = false;

let userInteracted = false;

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
behavior: "instant"
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

startButton.addEventListener(
"click",
async () => {

```
if (started) {
  return;
}

started = true;

startButton.disabled = true;


/*
 * El click permite iniciar audio en móviles.
 */
try {

  song.currentTime = 0;

  await song.play();

} catch (error) {

  console.warn(
    "No se pudo iniciar la música:",
    error
  );

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
```

}
);

/* ============================================================
REVELACIÓN DE LA CARTA
============================================================ */

async function revealLetter() {

letterParagraphs.forEach(paragraph => {

```
paragraph.classList.remove(
  "visible"
);
```

});

/*

* Calculamos cuánto debería tardar cada párrafo
* dependiendo de su cantidad de palabras.
  */
  for (
  let index = 0;
  index < letterParagraphs.length;
  index++
  ) {

```
const paragraph =
```

```
  letterParagraphs[index];

const wordCount =
  paragraph.textContent
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;


/*
 * Tiempo matemático aproximado de lectura.
 */
const readingTime =
  (wordCount / WORDS_PER_MINUTE) * 60 * 1000;


/*
 * Evitamos que un párrafo demasiado corto
 * pase demasiado rápido.
 */
const delay =
  Math.max(
    MIN_PARAGRAPH_TIME,
    readingTime * 1000 +
    EXTRA_READING_TIME
  );


/*
 * El primer párrafo aparece rápidamente.
 */
if (index === 0) {
  await wait(600);
}


paragraph.classList.add("visible");


createHeartBurst(
  window.innerWidth * (
    0.35 + Math.random() * 0.3
  ),
  window.innerHeight * (
    0.25 + Math.random() * 0.4
  ),
  index === letterParagraphs.length - 1
    ? 10
    : 3
);


/*
 * Si ella interactúa mientras estamos leyendo,
 * ya no hacemos auto-scroll posteriormente.
 */
if (!userInteracted) {

  await wait(delay);

} else {

  /*
   * Si ya empezó a interactuar, seguimos mostrando
   * el contenido sin forzar el tiempo de lectura.
   */
  await wait(700);

}
```

}

/*

* Terminó de aparecer toda la carta.
  */
  readingComplete.classList.remove(
  "hidden"
  );

/*

* Si ella ya interactuó con la pantalla,
* NO hacemos ningún auto-scroll.
  */
  if (
  userInteracted ||
  autoScrollCancelled
  ) {
  return;
  }

await wait(AUTO_SCROLL_DELAY);

/*

* Última comprobación antes de mover la página.
  */
  if (
  userInteracted ||
  autoScrollCancelled
  ) {
  return;
  }

await autoScrollToDreams();
}

/* ============================================================
AUTO-SCROLL INTELIGENTE
============================================================ */

function autoScrollToDreams() {

return new Promise(resolve => {

```
if (
  autoScrollCancelled ||
  userInteracted
) {
  resolve();
  return;
}


isAutoScrolling = true;


const startY =
  window.scrollY;

const target =
  dreamsScreen.getBoundingClientRect().top +
  window.scrollY -
  15;


const distance =
  target - startY;

const startTime =
  performance.now();


function animateScroll(currentTime) {

  /*
   * Si ella toca, desliza o interactúa,
   * detenemos TODO inmediatamente.
   */
  if (
    autoScrollCancelled ||
    userInteracted
  ) {

    isAutoScrolling = false;

    resolve();

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
   * Ease-in-out:
   * comienza despacio,
   * acelera,
   * y vuelve a frenar al final.
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
    startY + distance * eased
  );


  if (progress < 1) {

    requestAnimationFrame(
      animateScroll
    );

  } else {

    isAutoScrolling = false;

    setTimeout(
      resolve,
      AUTO_SCROLL_FINISH_DELAY
    );
  }
}


requestAnimationFrame(
  animateScroll
);
```

});
}

/* ============================================================
DETECTAR INTERACCIÓN MANUAL
============================================================ */

/*

* Esta es la parte importante:
*
* Si ella toca la pantalla, hace scroll, mueve el dedo,
* rueda la pantalla, usa una tecla, etc., cancelamos
* el auto-scroll.
  */

function cancelAutoScroll() {

if (
isAutoScrolling ||
!autoScrollCancelled
) {

```
autoScrollCancelled = true;
```

}

userInteracted = true;
}

window.addEventListener(
"touchstart",
cancelAutoScroll,
{
passive: true
}
);

window.addEventListener(
"touchmove",
cancelAutoScroll,
{
passive: true
}
);

window.addEventListener(
"wheel",
cancelAutoScroll,
{
passive: true
}
);

window.addEventListener(
"pointerdown",
event => {

```
/*
 * Ignoramos algunos clicks internos para que
 * pulsar un botón no sea tratado como scroll manual.
 */

if (
  event.target.closest("button")
) {
  return;
}

cancelAutoScroll();
```

},
{
passive: true
}
);

window.addEventListener(
"keydown",
event => {

```
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
  cancelAutoScroll();
}
```

}
);

/* ============================================================
DREAMS → PREGUNTA
============================================================ */

questionButton.addEventListener(
"click",
async () => {

```
showTransition();

await wait(750);

/*
 * La pregunta es MANUAL.
 *
 * No existe ningún auto-scroll después
 * de esta pantalla.
 */
showScreen(questionScreen);

hideTransition();


createHeartBurst(
  window.innerWidth / 2,
  window.innerHeight * 0.35,
  18
);
```

}
);

/* ============================================================
RESPUESTA
============================================================ */

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

showTransition();

await wait(1000);

showScreen(finalScreen);

hideTransition();

/*

* Primera explosión.
  */
  setTimeout(() => {

```
createHeartBurst(
```

```
  window.innerWidth / 2,
  window.innerHeight * 0.42,
  35
);
```

}, 250);

/*

* Segunda explosión.
  */
  setTimeout(() => {

```
createHeartBurst(
```

```
  window.innerWidth * 0.25,
  window.innerHeight * 0.55,
  20
);
```

}, 500);

/*

* Tercera explosión.
  */
  setTimeout(() => {

```
createHeartBurst(
```

```
  window.innerWidth * 0.75,
  window.innerHeight * 0.55,
  20
);
```

}, 750);

/*

* Guardamos únicamente que llegó al final.
*
* Esto NO manda información a ningún servidor.
  */
  try {

```
localStorage.setItem(
```

```
  "forVv_answer",
  "yes"
);
```

} catch (error) {

```
console.warn(
  "No se pudo utilizar localStorage."
);
```

}
}

/* ============================================================
CORAZONES
============================================================ */

function createHeartBurst(
x,
y,
amount = 12
) {

const symbols = [
"♡",
"♥",
"♡",
"♥",
"♡"
];

for (
let i = 0;
i < amount;
i++
) {

```
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
  Math.random() *
  180;


const vx =
  Math.cos(angle) *
  distance;


const vy =
  Math.sin(angle) *
  distance;


const size =
  0.8 +
  Math.random() *
  1.4;


const rotation =
  -35 +
  Math.random() *
  70;


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


heartContainer.appendChild(
  heart
);


setTimeout(() => {

  heart.remove();

}, 1900);
```

}
}

/* ============================================================
CORAZONES AMBIENTALES
============================================================ */

function createAmbientHeart() {

const heart =
document.createElement("span");

heart.textContent =
Math.random() > 0.5
? "♡"
: "·";

heart.style.position =
"fixed";

heart.style.left =
`${Math.random() * 100}%`;

heart.style.bottom =
"-30px";

heart.style.color =
"rgba(217, 87, 134, 0.18)";

heart.style.fontSize =
`${0.7 + Math.random() * 0.8}rem`;

heart.style.pointerEvents =
"none";

heart.style.zIndex =
"2";

heart.animate(
[
{
transform:
"translateY(0) rotate(0deg)",

```
    opacity: 0
  },

  {
    opacity: 1
  },

  {
    transform:
      `translateY(-110vh) rotate(${
        20 +
        Math.random() * 60
      }deg)`,

    opacity: 0
  }
],
{
  duration:
    9000 +
    Math.random() * 7000,

  easing: "linear",

  fill: "forwards"
}
```

);

document.body.appendChild(
heart
);

setTimeout(() => {

```
heart.remove();
```

}, 17000);
}

setInterval(
createAmbientHeart,
2200
);

/* ============================================================
AUDIO
============================================================ */

song.addEventListener(
"ended",
() => {

```
console.log(
  "La canción terminó."
);
```

}
);

song.addEventListener(
"error",
() => {

```
console.warn(
  "No se pudo cargar Glue Song.mp3. " +
  "Comprueba que el archivo esté dentro de assets/ " +
  "y que el nombre coincida exactamente."
);
```

}
);

/* ============================================================
DEBUG
============================================================ */

console.log(
"%c♡ Para ti ♡",
`     color: #d95786;
    font-size: 22px;
    font-weight: bold;
  `
);

console.log(
"Experiencia romántica inicializada."
);
