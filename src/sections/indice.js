import './indice.css';
import { projetos, filtros, totalProjetos } from '../data/projetos.js';

const linha = (p) => `
  <li class="linha" tabindex="0" data-linha data-filtro="${p.filtro}" data-foto="${p.foto}"
      aria-label="${p.cliente}, ${p.disciplina}, ${p.cidade}, ${p.ano}">
    <span class="linha__faixa" aria-hidden="true"></span>
    <span class="linha__ano">${p.ano}</span>
    <span class="linha__cliente">${p.cliente}</span>
    <span class="linha__disciplina">${p.disciplina}</span>
    <span class="linha__cidade">${p.cidade}</span>
    <img class="linha__mini" src="${p.foto}" alt="" loading="lazy" width="64" height="64" />
  </li>`;

export const indice = () => `
<section class="indice" id="projetos" aria-labelledby="indice-titulo">
  <header class="indice__topo">
    <h2 class="indice__titulo" id="indice-titulo">Todos os projetos</h2>
    <div class="indice__filtros" role="group" aria-label="Filtrar projetos">
      ${filtros.map((f, i) => `<button class="pilula${i === 0 ? ' is-ativo' : ''}" type="button" data-filtro-botao="${f.id}" aria-pressed="${i === 0}">${f.nome}</button>`).join('')}
    </div>
  </header>
  <div class="indice__cabeca rotulo" aria-hidden="true">
    <span>Ano</span><span>Cliente</span><span>Disciplina</span><span>Cidade</span>
  </div>
  <ul class="indice__lista" data-lista>
    ${projetos.map(linha).join('')}
  </ul>
  <p class="indice__total rotulo" data-total aria-live="polite">${projetos.length} de ${totalProjetos} projetos</p>
  <figure class="indice__foto" data-foto-flutuante aria-hidden="true"><img alt="" /></figure>
</section>`;
