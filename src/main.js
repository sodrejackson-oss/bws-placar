import './styles/tokens.css';
import './styles/base.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { nav } from './sections/nav.js';
import { hero } from './sections/hero.js';
import { estudio } from './sections/estudio.js';
import { metodo } from './sections/metodo.js';
import { indice } from './sections/indice.js';
import { contato } from './sections/contato.js';

import { criarCena } from './motion/cena.js';
import { criarPercurso } from './motion/percurso.js';
import { animarNav } from './motion/nav.js';
import { animarEstudio } from './motion/estudio.js';
import { animarMetodo } from './motion/metodo.js';
import { animarIndice } from './motion/indice.js';
import { animarContato } from './motion/contato.js';
import { criarSuave } from './motion/suave.js';

gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ponteiroFino = window.matchMedia('(pointer: fine)').matches;
const opcoes = { reduzido, ponteiroFino };

document.querySelector('#app').innerHTML = `
  ${nav()}
  <main>
    ${hero()}
    ${estudio()}
    ${metodo()}
    ${indice()}
  </main>
  ${contato()}
`;

// 1. pins primeiro (túnel e método), na ordem da página
const cena = criarCena(document.querySelector('[data-cena]'), opcoes);
criarPercurso(document.querySelector('.tunel'), cena);
animarEstudio(opcoes);
animarMetodo(opcoes);
animarIndice(opcoes);
animarContato(opcoes);
animarNav();
ScrollTrigger.refresh();

// 2. só depois o Lenis (senão ele guarda a altura antiga e a página trava)
const lenis = reduzido ? null : criarSuave();
if (lenis) lenis.resize();

// 3. as fontes mudam as medidas
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());

window.__margem = { cena, lenis, ScrollTrigger };
