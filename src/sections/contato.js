import './contato.css';
import wordmark from '../brand/margem.svg?raw';

// [foto, x %, y %, profundidade 0 (longe) a 1 (perto)]
const flutuantes = [
  ['t03', 6, 8, 0.95], ['t11', 30, 4, 0.25], ['t20', 74, 6, 0.8], ['t14', 88, 30, 0.35],
  ['t04', 2, 44, 0.4], ['t26', 18, 66, 0.15], ['t09', 82, 62, 1], ['t25', 60, 82, 0.3],
  ['t17', 12, 86, 0.7], ['t22', 44, 2, 0.1], ['t05', 92, 84, 0.5], ['t19', 66, 30, 0.12],
  ['t13', 24, 30, 0.2], ['t28', 40, 88, 0.6],
];

export const contato = () => `
<section class="depoimento" aria-label="Depoimento">
  <div class="depoimento__campo" aria-hidden="true">
    ${flutuantes.map(([f, x, y, z]) => `<img class="flutua" data-prof="${z}" src="/trabalhos/${f}.webp" alt="" loading="lazy"
      style="--x:${x}%;--y:${y}%;--z:${z}" />`).join('')}
  </div>
  <figure class="depoimento__citacao">
    <blockquote><p>Eles passaram três semanas só ouvindo. A marca saiu em dez dias e nunca mais mexemos.</p></blockquote>
    <figcaption class="rotulo">Lúcia Amaral, Torra Alta</figcaption>
  </figure>
</section>
<footer class="rodape" id="contato">
  <div class="rodape__colunas">
    <div class="rodape__chamada">
      <p class="rodape__pergunta">Tem uma marca para desenhar?</p>
      <a class="pilula pilula--preta pilula--grande" href="mailto:ola@margem.studio">Escrever para o estúdio</a>
    </div>
    <address class="rodape__contato">
      <a class="sublinha" href="mailto:ola@margem.studio">ola@margem.studio</a>
      <span>Rua da Harmonia, Recife</span>
    </address>
    <ul class="rodape__redes">
      <li><a class="sublinha" href="https://instagram.com" rel="noopener">Instagram</a></li>
      <li><a class="sublinha" href="https://behance.net" rel="noopener">Behance</a></li>
      <li><a class="sublinha" href="https://linkedin.com" rel="noopener">LinkedIn</a></li>
    </ul>
  </div>
  <div class="rodape__marca-janela">
    <div class="rodape__marca wordmark" data-marca-rodape aria-hidden="true">${wordmark}</div>
  </div>
</footer>`;
