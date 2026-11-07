// A nav some ao rolar para baixo (depois de meia tela) e volta ao rolar para cima,
// com um véu atrás quando reaparece no meio da página.
export function animarNav() {
  const nav = document.querySelector('[data-nav]');
  let ultimo = window.scrollY;
  const aoRolar = () => {
    const y = window.scrollY;
    const meio = window.innerHeight * 0.5;
    if (y > ultimo + 2 && y > meio) nav.classList.add('is-escondida');
    else if (y < ultimo - 2 || y <= meio) nav.classList.remove('is-escondida');
    nav.classList.toggle('is-veu', y > meio);
    ultimo = y;
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  // ao focar pelo teclado, a nav aparece
  nav.addEventListener('focusin', () => nav.classList.remove('is-escondida'));
}
