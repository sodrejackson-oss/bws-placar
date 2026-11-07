# Margem — guia do projeto

Site de um estúdio de design de marcas (inventado) com um túnel 3D de trabalhos.
Vite sem framework: HTML, CSS e JS puros. `npm run dev` (porta 5173) · `npm run build` → `dist/`.

> O guia e a pasta `arquivos/` originais não vieram com o repositório. Este guia foi
> reescrito a partir do briefing, e as imagens de `arquivos/` são **provisórias**,
> desenhadas por código. Veja `arquivos/trabalhos.md`.

## Mapa
- `src/styles/tokens.css` — todas as cores, fontes, tamanhos e margens. Mude a marca aqui primeiro.
- `src/sections/*.js` — uma seção por arquivo; cada uma exporta o HTML e importa o próprio CSS.
- `src/motion/` — `cena.js` (Three), `percurso.js` (timeline do túnel), um módulo por seção, `suave.js` (Lenis).
- `src/data/` — `casos.js` (4 destaques), `projetos.js` (índice), `pecas.json` (proporções das fotos do túnel).
- `public/trabalhos/` — as fotos servidas. `src/brand/margem.svg` — wordmark (inline, `currentColor`).

## Design system
- Fundo `#f2f0eb`, texto `#141414`, secundário `#5d5b56`, fios `#dcd8cf`, pílulas `#fff`.
- Acentos só em um detalhe por seção: terracota `#d9653b`, verde-mata `#2f4a3a`.
- Geist 400/500 em tudo. Nomes de cliente com tracking −0,045em.
- Nada de grade de cards: cada seção tem uma ideia de layout própria.

## Regras de qualidade
- Ordem de inicialização: pins (túnel, método) → `ScrollTrigger.refresh()` → Lenis. Refresh de novo quando as fontes carregam.
- Valores que dependem da tela são funções, com `invalidateOnRefresh: true`.
- O renderer desenha só quando algo muda (scroll, cursor, textura). Pixel ratio ≤ 2.
- `prefers-reduced-motion`: sem Lenis, sem cursor, sem lerp da câmera, sem entradas; o túnel segue o scroll.
- Imagens fora do túnel com `loading="lazy"`. Foco visível em tudo que é clicável.

## Como conferir
Rode `npm run dev` e tire prints com Playwright (Chromium já instalado) em 1440×900 e 390×844:
topo do hero, cada case aberto, fim do túnel, Estúdio, Método (início e fim), Índice com hover,
depoimento, rodapé. Confira o console sem erros e a página rolando até o fim nos dois modos de movimento.

### Checklist de aceitação
- [ ] Túnel: 78 planos + 4 destaques; cada destaque sai da parede, cobre a tela, mostra o case e é atravessado.
- [ ] Nav some ao descer e volta ao subir, com véu; links levam às seções.
- [ ] Manifesto com fotos na linha, notas na margem com fios que se desenham.
- [ ] Método: tira desliza, régua marca a etapa.
- [ ] Índice: filtros funcionam e contam "N de 41"; hover terracota com foto seguindo o cursor.
- [ ] Depoimento com fotos em profundidade; rodapé com wordmark de borda a borda.
- [ ] Celular: case abaixo da foto, margem vira lista, linhas com miniatura.

## Personalizar
1. Cores e fontes em `tokens.css`; wordmark em `src/brand/margem.svg` (mantenha `stroke="currentColor"` e a proporção, ou ajuste os cálculos de baseline em `hero.css`).
2. Textos: `src/data/casos.js`, `src/data/projetos.js` e o HTML de cada seção.
3. Fotos: troque os arquivos em `public/trabalhos/` mantendo os nomes. Destaques em paisagem 3:2 (≥ 1500 px);
   paredes do túnel com a proporção registrada em `src/data/pecas.json`.
4. Foto gerada por IA nunca pode aparecer como trabalho de cliente.
