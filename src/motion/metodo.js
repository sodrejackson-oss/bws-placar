import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// A tira de filme desliza com o scroll; a régua marca a etapa ativa.
export function animarMetodo() {
  const palco = document.querySelector('[data-metodo]');
  const tira = palco.querySelector('[data-tira]');
  const quadros = [...palco.querySelectorAll('[data-quadro]')];
  const etapas = [...palco.querySelectorAll('[data-etapa]')];
  const cheio = palco.querySelector('[data-regua-cheio]');
  const legenda = palco.querySelector('[data-legenda]');
  const frases = etapas.map((e) => e.querySelector('.regua__frase').textContent);

  // deslocamento máximo: a tira encosta nas margens, sem vazio nas pontas
  const deslocamento = () => Math.max(0, tira.scrollWidth - tira.parentElement.clientWidth);
  // posição que leva o quadro i ao centro, limitada às pontas
  const alvo = (i) => {
    const q = quadros[i];
    const janela = tira.parentElement.clientWidth;
    const x = q.offsetLeft + q.offsetWidth / 2 - janela / 2;
    return -Math.min(deslocamento(), Math.max(0, x));
  };

  let ativo = -1;
  const ativar = (i) => {
    if (i === ativo) return;
    ativo = i;
    quadros.forEach((q, k) => q.classList.toggle('is-ativo', k === i));
    etapas.forEach((e, k) => e.classList.toggle('is-ativa', k === i));
    legenda.textContent = frases[i];
  };
  ativar(0);

  ScrollTrigger.create({
    trigger: palco,
    start: 'top top',
    end: () => '+=' + window.innerHeight * 2.6,
    pin: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const p = self.progress;
      const f = p * (quadros.length - 1);
      const i = Math.floor(f);
      const t = f - i;
      const e = t * t * (3 - 2 * t);
      const x = i >= quadros.length - 1 ? alvo(quadros.length - 1) : gsap.utils.interpolate(alvo(i), alvo(i + 1), e);
      gsap.set(tira, { x });
      gsap.set(cheio, { scaleX: p });
      ativar(Math.min(quadros.length - 1, Math.round(f)));
    },
  });
}
