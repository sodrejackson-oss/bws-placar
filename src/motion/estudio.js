import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Manifesto: palavras sobem; notas da margem ligadas por fios curvos que se desenham.
export function animarEstudio({ reduzido }) {
  const pagina = document.querySelector('[data-estudio]');
  const texto = pagina.querySelector('[data-manifesto]');
  const palavras = [...texto.querySelectorAll('.palavra')];
  const svg = pagina.querySelector('[data-fios]');
  const notas = [...pagina.querySelectorAll('[data-nota]')];
  const margem = pagina.querySelector('.estudio__margem');
  const bolinhas = pagina.querySelectorAll('[data-bolinha]');
  const mobile = window.matchMedia('(max-width: 760px)');

  if (!reduzido) {
    gsap.from(palavras.map((p) => p.firstElementChild), {
      yPercent: 45, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.022,
      scrollTrigger: { trigger: texto, start: 'top 78%', once: true },
    });
    gsap.from(bolinhas, {
      scale: 0, y: 14, duration: 0.6, ease: 'back.out(2.4)', stagger: 0.07,
      scrollTrigger: { trigger: bolinhas[0], start: 'top 92%', once: true },
    });
  }

  // fim da linha onde está a palavra-âncora
  const fimDaLinha = (ancora) => {
    const r = ancora.getBoundingClientRect();
    let direita = r.right;
    for (const p of palavras) {
      const q = p.getBoundingClientRect();
      if (Math.abs(q.top - r.top) < r.height * 0.5) direita = Math.max(direita, q.right);
    }
    return { x: direita, y: r.top + r.height * 0.55 };
  };

  const fios = [];
  const medir = () => {
    if (mobile.matches) return;
    const base = pagina.getBoundingClientRect();
    const mg = margem.getBoundingClientRect();
    notas.forEach((nota) => {
      const id = nota.dataset.nota;
      const ancora = texto.querySelector(`[data-ancora="${id}"]`);
      const fim = fimDaLinha(ancora);
      const y = fim.y - base.top;
      nota.style.top = `${y - mg.top + base.top - nota.offsetHeight / 2}px`;
      const ponto = nota.querySelector('.nota__ponto').getBoundingClientRect();
      const x0 = fim.x - base.left + 14;
      const x1 = ponto.left - base.left - 6;
      const dx = x1 - x0;
      const path = svg.querySelector(`[data-fio="${id}"]`);
      path.setAttribute('d', `M${x0} ${y} C${x0 + dx * 0.35} ${y + 42}, ${x1 - dx * 0.4} ${y + 34}, ${x1} ${y}`);
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.dataset.len = len;
    });
  };
  medir();

  notas.forEach((nota) => {
    const id = nota.dataset.nota;
    const path = svg.querySelector(`[data-fio="${id}"]`);
    const ancora = texto.querySelector(`[data-ancora="${id}"]`);
    if (reduzido) { path.style.strokeDashoffset = '0'; return; }
    gsap.set(nota, { autoAlpha: 0, x: -8 });
    const st = ScrollTrigger.create({
      trigger: ancora,
      start: 'top 82%',
      end: 'top 52%',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const len = +path.dataset.len || 0;
        path.style.strokeDashoffset = `${len * (1 - self.progress)}`;
        const chegou = self.progress > 0.97 || mobile.matches;
        gsap.to(nota, { autoAlpha: chegou ? 1 : 0, x: chegou ? 0 : -8, duration: 0.4, overwrite: true });
      },
    });
    fios.push(st);
    path.style.strokeDashoffset = `${path.dataset.len}`;
  });

  if (mobile.matches && !reduzido) gsap.set(notas, { autoAlpha: 1, x: 0 });

  ScrollTrigger.addEventListener('refreshInit', () => {
    if (mobile.matches) gsap.set(notas, { autoAlpha: 1, x: 0, clearProps: 'top' });
    medir();
  });
}
