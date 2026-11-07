import './estudio.css';

// Quebra o texto em palavras animáveis. {a:id} marca a palavra que ancora uma nota.
const palavras = (txt) => txt.split(' ').filter(Boolean).map((w) => {
  const m = w.match(/^\{([a-z]+)\}(.*)$/);
  const ancora = m ? ` data-ancora="${m[1]}"` : '';
  const texto = m ? m[2] : w;
  return `<span class="palavra"${ancora}><span>${texto}</span></span>`;
}).join(' ');

const foto = (palavra, src, pos, ancora = '') =>
  `<span class="palavra palavra--foto"${ancora ? ` data-ancora="${ancora}"` : ''}><span class="foto-linha" style="--pos:${pos}"><img src="${src}" alt="" loading="lazy" width="250" height="82" /><span class="sr">${palavra}</span></span></span>`;

const notas = [
  { id: 'pessoas', texto: 'desde 2016' },
  { id: 'desenhamos', texto: '41 projetos' },
  { id: 'dois-pontos', texto: '9 cidades do Nordeste' },
];

const equipe = ['#d9653b', '#2f4a3a', '#b9a888', '#3a3a38', '#cfc9bd', '#7d8467'];

export const estudio = () => `
<section class="estudio" id="estudio" aria-labelledby="estudio-rotulo">
  <div class="estudio__pagina" data-estudio>
    <div class="estudio__coluna">
      <p class="rotulo" id="estudio-rotulo">Estúdio</p>
      <p class="estudio__texto" data-manifesto>
        ${palavras('Somos seis {pessoas}pessoas numa casa no Poço da Panela.')}
        ${palavras('{desenhamos}Desenhamos marcas para quem faz coisas com as')}
        ${foto('mãos', '/trabalhos/sol.webp', '30% 62%')}<span class="palavra" data-ancora="dois-pontos"><span>:</span></span>
        ${palavras('café,')}
        ${foto('cerâmica', '/trabalhos/t24.webp', '50% 52%')}${palavras(', livro, cadeira, festa.')}
      </p>
      <ul class="estudio__equipe" aria-label="Seis pessoas no estúdio">
        ${equipe.map((c) => `<li style="--cor:${c}" data-bolinha></li>`).join('')}
      </ul>
    </div>
    <aside class="estudio__margem" aria-label="Notas">
      <ul>
        ${notas.map((n) => `<li class="nota" data-nota="${n.id}"><span class="nota__ponto"></span>${n.texto}</li>`).join('')}
      </ul>
    </aside>
    <svg class="estudio__fios" data-fios aria-hidden="true">
      ${notas.map((n) => `<path data-fio="${n.id}" />`).join('')}
    </svg>
  </div>
</section>`;
