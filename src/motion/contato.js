import { gsap } from 'gsap';

// Fotos flutuando em profundidade (eco do túnel) e o wordmark subindo no rodapé.
export function animarContato({ reduzido }) {
  const secao = document.querySelector('.depoimento');
  secao.querySelectorAll('.flutua').forEach((el) => {
    const z = +el.dataset.prof;
    gsap.fromTo(el, { y: 160 * z }, {
      y: -160 * z, ease: 'none',
      scrollTrigger: { trigger: secao, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  const marca = document.querySelector('[data-marca-rodape]');
  if (!reduzido) {
    gsap.fromTo(marca, { yPercent: 70 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: marca.parentElement, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
}
