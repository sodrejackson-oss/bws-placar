import { gsap } from 'gsap';
import { casos } from '../data/casos.js';

const VEL = 9; // unidades de z por unidade de tempo da timeline

// A timeline do túnel: hero sai, cada destaque é puxado, lido e atravessado.
export function criarPercurso(secao, cena) {
  const { estado } = cena;
  const hero = secao.querySelectorAll('[data-hero]');
  const progresso = secao.querySelector('[data-progresso]');
  const final = secao.querySelector('[data-final]');
  const overlays = [...secao.querySelectorAll('[data-case]')];

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: () => cena.pedir(),
    scrollTrigger: {
      trigger: secao,
      start: 'top top',
      end: () => '+=' + window.innerHeight * 11,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(progresso, { scaleX: self.progress }),
    },
  });

  // 1. o hero sai
  tl.to(hero, { y: -30, autoAlpha: 0, duration: 0.9, ease: 'power1.in' }, 0);

  let z = cena.CAMERA_Z0;
  casos.forEach((c, i) => {
    const el = overlays[i];
    const itens = el.querySelectorAll('[data-entra]');
    const aproximar = c.z + 10;

    // viagem até 10 unidades antes do destaque
    tl.to(estado, { camZ: aproximar, duration: Math.abs(z - aproximar) / VEL }, i === 0 ? 0 : '>');

    // puxa a foto da parede e encosta a câmera até ela cobrir a tela
    tl.addLabel(`puxar${i}`);
    tl.to(estado.puxar, { [i]: 1, duration: 1.3, ease: 'power2.inOut' }, `puxar${i}`);
    tl.to(estado, { camZ: () => c.z + cena.dCobrir(), duration: 1.3, ease: 'power2.inOut' }, `puxar${i}`);

    // o texto do case entra, segura, sai
    tl.set(el, { autoAlpha: 1 });
    tl.fromTo(itens, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' });
    tl.to({}, { duration: 1 });
    tl.to(itens, { y: -12, autoAlpha: 0, duration: 0.3, stagger: 0.02, ease: 'power1.in' });
    tl.set(el, { autoAlpha: 0 });

    // a câmera atravessa a foto
    tl.to(estado, { camZ: c.z - 0.6, duration: 0.9, ease: 'power2.in' });
    tl.set(estado.puxar, { [i]: 0 });
    z = c.z - 0.6;
  });

  // 3. depois do último: o fim do corredor
  tl.to(estado, { camZ: -88, duration: Math.abs(z + 88) / VEL });
  tl.fromTo(final, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
  tl.to({}, { duration: 0.4 });

  return tl;
}
