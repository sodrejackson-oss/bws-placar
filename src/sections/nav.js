import './nav.css';
import wordmark from '../brand/margem.svg?raw';

export const nav = () => `
<header class="nav" data-nav>
  <a class="nav__marca wordmark" href="#topo" aria-label="Margem, início">${wordmark}</a>
  <nav aria-label="Principal">
    <ul class="nav__lista">
      <li><a class="pilula" href="#projetos">Projetos</a></li>
      <li><a class="pilula" href="#estudio">Estúdio</a></li>
      <li><a class="pilula" href="#contato">Contato</a></li>
    </ul>
  </nav>
</header>`;
