import './hero.css';
import wordmark from '../brand/margem.svg?raw';
import { casos } from '../data/casos.js';

const caso = (c, i) => `
  <article class="case" data-case="${i}" aria-label="${c.cliente}">
    <div class="case__nevoa" aria-hidden="true"></div>
    <p class="case__num" data-entra>${String(i + 1).padStart(2, '0')} / ${String(casos.length).padStart(2, '0')}</p>
    <div class="case__texto">
      <p class="case__meta" data-entra>${c.ano} · ${c.disciplina} · ${c.cidade}</p>
      <h2 class="case__cliente" data-entra>${c.cliente}</h2>
      <p class="case__resumo" data-entra>${c.resumo[0]}<br />${c.resumo[1]}</p>
      <a class="pilula pilula--preta case__abrir" href="#projetos" data-entra>Abrir o case →</a>
    </div>
  </article>`;

export const hero = () => `
<section class="tunel" id="topo" aria-label="Trabalhos em destaque">
  <canvas class="tunel__cena" data-cena aria-hidden="true"></canvas>
  <div class="tunel__hero">
    <h1 class="tunel__frase" data-hero>Marcas que ainda fazem sentido<br />daqui a dez anos.</h1>
    <div class="tunel__marca wordmark" data-hero aria-hidden="true">${wordmark}</div>
    <p class="tunel__rotulo tunel__rotulo--rolar" data-hero><span>Role para entrar</span></p>
    <p class="tunel__rotulo tunel__rotulo--cidade" data-hero><span>Recife · 41 projetos desde 2016</span></p>
  </div>
  ${casos.map(caso).join('')}
  <div class="tunel__final" data-final>
    <p class="tunel__final-frase">Quatro de 41.</p>
    <a class="pilula pilula--preta pilula--grande" href="#projetos">Ver todos os projetos</a>
  </div>
  <div class="tunel__progresso" aria-hidden="true"><span data-progresso></span></div>
</section>`;
