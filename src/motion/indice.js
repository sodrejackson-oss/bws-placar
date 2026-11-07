import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { totalProjetos } from '../data/projetos.js';

// Filtros e a foto que segue o cursor.
export function animarIndice({ reduzido, ponteiroFino }) {
  const lista = document.querySelector('[data-lista]');
  const linhas = [...lista.querySelectorAll('[data-linha]')];
  const botoes = [...document.querySelectorAll('[data-filtro-botao]')];
  const total = document.querySelector('[data-total]');
  const foto = document.querySelector('[data-foto-flutuante]');
  const img = foto.querySelector('img');
  const largo = window.matchMedia('(min-width: 761px)');

  // —— filtros ——
  botoes.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filtroBotao;
    botoes.forEach((o) => {
      const on = o === b;
      o.classList.toggle('is-ativo', on);
      o.setAttribute('aria-pressed', String(on));
    });
    let n = 0;
    linhas.forEach((l) => {
      const mostra = f === 'todos' || l.dataset.filtro === f;
      l.hidden = !mostra;
      if (mostra) n++;
    });
    total.textContent = `${n} de ${totalProjetos} projetos`;
    if (!reduzido) gsap.fromTo(linhas.filter((l) => !l.hidden), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' });
    ScrollTrigger.refresh();
  }));

  // —— foto flutuante ——
  const dur = reduzido ? 0.01 : 0.55;
  const xTo = gsap.quickTo(foto, 'x', { duration: dur, ease: 'power3.out' });
  const yTo = gsap.quickTo(foto, 'y', { duration: dur, ease: 'power3.out' });
  let visivel = false;

  const mostrar = (linha) => {
    if (!largo.matches) return;
    const src = linha.dataset.foto;
    if (!img.src.endsWith(src)) img.src = src;
    gsap.to(foto, { autoAlpha: 1, scale: 1, rotation: gsap.utils.random(-5, 5), duration: reduzido ? 0 : 0.45, ease: 'power3.out', overwrite: 'auto' });
    visivel = true;
  };
  const esconder = () => {
    if (!visivel) return;
    visivel = false;
    gsap.to(foto, { autoAlpha: 0, scale: 0.6, duration: reduzido ? 0 : 0.35, ease: 'power2.in', overwrite: 'auto' });
  };
  const seguir = (cx, cy) => {
    const h = foto.offsetHeight;
    xTo(cx + 140);
    yTo(cy - h / 2);
  };

  if (ponteiroFino) {
    lista.addEventListener('pointermove', (e) => seguir(e.clientX, e.clientY));
    linhas.forEach((l) => l.addEventListener('pointerenter', (e) => {
      if (!visivel) gsap.set(foto, { x: e.clientX + 140, y: e.clientY - foto.offsetHeight / 2 });
      mostrar(l);
    }));
    lista.addEventListener('pointerleave', esconder);
  }

  // teclado: a foto acompanha a linha em foco
  linhas.forEach((l) => {
    l.addEventListener('focus', () => {
      const r = l.getBoundingClientRect();
      const cx = r.left + r.width * 0.46;
      if (!visivel) gsap.set(foto, { x: cx + 140, y: r.top + r.height / 2 - foto.offsetHeight / 2 });
      seguir(cx, r.top + r.height / 2);
      mostrar(l);
    });
    l.addEventListener('blur', (e) => { if (!lista.contains(e.relatedTarget)) esconder(); });
  });
  window.addEventListener('scroll', () => { if (visivel && !lista.matches(':hover') && !lista.contains(document.activeElement)) esconder(); }, { passive: true });
}
