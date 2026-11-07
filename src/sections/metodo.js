import './metodo.css';
import { arquivo } from '../data/caminho.js';

const etapas = [
  { n: '01', nome: 'Escuta', frase: 'Antes de desenhar, três semanas ouvindo quem faz.' },
  { n: '02', nome: 'Rascunho', frase: 'Lápis até uma forma aguentar sozinha.' },
  { n: '03', nome: 'Sistema', frase: 'Cor, letra e regra para a marca andar sem a gente.' },
  { n: '04', nome: 'Rua', frase: 'Prateleira, fachada, sacola: onde a marca trabalha.' },
];

// A marca da Torra Alta sobre a grade de construção, em código.
const grade = () => {
  const cx = 150, by = 262, s = 92;
  const domos = [[0, 1], [-0.62, 0.78], [-1.14, 0.5]];
  const linhas = [];
  for (let x = 30; x <= 270; x += 20) linhas.push(`<line x1="${x}" y1="40" x2="${x}" y2="360" />`);
  for (let y = 40; y <= 360; y += 20) linhas.push(`<line x1="30" y1="${y}" x2="270" y2="${y}" />`);
  const circ = domos.map(([o, r]) => `<circle cx="${cx}" cy="${by + o * s}" r="${r * s}" />`).join('');
  const base = domos.map(([o]) => `<line class="forte" x1="20" y1="${by + o * s}" x2="280" y2="${by + o * s}" />`).join('');
  const marca = domos.map(([o, r]) => {
    const y = by + o * s, R = r * s;
    return `<path d="M${cx - R} ${y} A${R} ${R} 0 0 1 ${cx + R} ${y} Z" />`;
  }).join('');
  return `<svg viewBox="0 0 300 400" class="metodo__svg" role="img" aria-label="A marca da Torra Alta sobre a grade de construção">
    <rect width="300" height="400" fill="#f7f5f0" />
    <g class="grade">${linhas.join('')}</g>
    <g class="construcao">${circ}${base}<line class="forte" x1="${cx}" y1="30" x2="${cx}" y2="370" /></g>
    <g class="marca">${marca}</g>
  </svg>`;
};

const quadros = [
  `<img src="${arquivo('trabalhos/metodo-rascunho.webp')}" alt="Rascunho a lápis das três meias-luas em papel manteiga" loading="lazy" width="900" height="1200" />`,
  grade(),
  `<img src="${arquivo('trabalhos/metodo-sistema.webp')}" alt="Prancha do sistema: marca, cores e letra" loading="lazy" width="900" height="1200" />`,
  `<img src="${arquivo('trabalhos/metodo-rua.webp')}" alt="Sacos de café Torra Alta na prateleira" loading="lazy" width="900" height="1200" />`,
];

export const metodo = () => `
<section class="metodo" id="metodo" aria-labelledby="metodo-titulo">
  <div class="metodo__palco" data-metodo>
    <h2 class="metodo__titulo" id="metodo-titulo">Como uma marca nasce aqui</h2>
    <div class="metodo__janela">
      <ol class="metodo__tira" data-tira>
        ${quadros.map((q, i) => `<li class="metodo__quadro${i === 0 ? ' is-ativo' : ''}" data-quadro aria-label="${etapas[i].n} ${etapas[i].nome}">${q}</li>`).join('')}
      </ol>
    </div>
    <div class="regua" data-regua>
      <div class="regua__fio"><span data-regua-cheio></span></div>
      <ol class="regua__etapas">
        ${etapas.map((e, i) => `<li class="regua__etapa${i === 0 ? ' is-ativa' : ''}" data-etapa style="--i:${i}">
          <span class="regua__marca"></span>
          <span class="regua__nome">${e.n}<span class="regua__palavra"> ${e.nome}</span></span>
          <span class="regua__frase">${e.frase}</span>
        </li>`).join('')}
      </ol>
      <p class="regua__legenda" data-legenda aria-live="polite">${etapas[0].frase}</p>
    </div>
  </div>
</section>`;
