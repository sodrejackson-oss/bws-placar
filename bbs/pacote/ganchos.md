# Ganchos: onde o código da loja chama as melhorias

São 19 pontos pequenos. Em cada uma, procure o trecho **Antes** no HTML da loja e troque pelo **Depois**.
Todas usam `window.Melhorias?.`: se o script das melhorias faltar, a loja continua funcionando como antes.

## A. Incluir os arquivos

1. **CSS.** No fim do `<head>`, depois do `</style>` da loja: o conteúdo de `melhorias.css` num `<style>`
   (ou `<link rel="stylesheet" href="css/melhorias.css">`).
2. **Melhorias.** Logo **antes** do `<script>` do app (o que começa com `BBS Store: aplicação`) e
   **depois** dos scripts do catálogo e do `Tee`: o conteúdo de `melhorias.js` num `<script>`
   (ou `<script src="js/melhorias.js"></script>`). Precisa vir antes do app.
3. **3D.** Depois do script do app: o conteúdo de `camisa3d.js` num `<script type="module" data-bbs3d>`.
   Com arquivos separados, basta deixar `camisa3d.js` na mesma pasta de `melhorias.js`, sem tag nenhuma.

## B. Galeria (camisa 3D)

4. Em `viewsDe(p)`:
   - Antes: `function viewsDe(p) {` ⏎ `  const v = ['foto'];`
   - Depois: `function viewsDe(p) {` ⏎ `  if (window.Melhorias?.usa3D(p)) return ['foto', '3d'];` ⏎ `  const v = ['foto'];`
5. `VIEW_NOME`: acrescentar `'3d': 'Sua camisa em 3D'`.
6. Em `refreshProduct()`, dentro de `vs.forEach(v => {`, como primeira linha:
   `    if (v === '3d') return; // o 3D se atualiza sozinho`
7. No fim de `refreshProduct()`, depois de `$('#pqty').value = sel.qtd;`:
   `  window.Melhorias?.produto(p);`

## C. Página de produto (`pageProduct`)

8. Personalização guardada:
   - Antes: `sel = { id, cor: p.cores[0], modelo: 'adulto', tamanho: null, qtd: 1, perso: {} };`
   - Depois: `sel = window.Melhorias?.restaurar(id) || { id, cor: p.cores[0], modelo: 'adulto', tamanho: null, qtd: 1, perso: {} };`
9. Prazo com data. Logo depois do `</div>` que fecha `<div class="preco">`:
   `<div class="entrega-prev" id="entregaPrev"></div>`
10. Recomendador de tamanho:
    - Antes: `<div class="opt-label">Escolha um tamanho <a href="#/ajuda/medidas">Tabela de medidas</a></div>` ⏎ `<div class="sizes" id="sizes"></div>`
    - Depois:
      ```html
      <div class="opt-label">Escolha um tamanho <span><button class="link tam-link" data-m="tam-ajuda">Qual é o meu tamanho?</button> <a href="#/ajuda/medidas">Tabela de medidas</a></span></div>
      <div class="sizes" id="sizes"></div>
      <div class="tam-ajuda" id="tamAjuda" hidden></div>
      ```
11. Mandar a prévia. Logo depois do `</div>` que fecha `<div class="buy-row">`:
    ```js
    ${p.personalizacao ? `<button class="btn btn-ghost btn-previa" data-m="compartilhar"><svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3z"/></svg>Mandar a prévia para alguém</button>` : ''}
    ```
12. Kit do time: `<div class="kit">` vira `<div class="kit" id="kit">` (o conteúdo de dentro pode ficar; as melhorias substituem).

## D. Validação, sacola e frete

13. Em `validateSel()`:
    - **Correção de defeito:** `el.classList.toggle('invalid', bad);` → `el.classList.toggle('invalid', !!bad);`
      (sem o `!!`, campo opcional alterna entre válido e inválido a cada clique em "Adicionar à sacola").
    - Fileira de tamanhos chama atenção quando falta o tamanho:
      `first = $('#sizes'); }` → `first = $('#sizes'); first.classList.remove('chamar'); void first.offsetWidth; first.classList.add('chamar'); }`
14. Em `addSelToCart()`, entre `saveCart();` e `return true;`:
    `  window.Melhorias?.aoAdicionar({ ...sel, perso });`
15. Sacola: depois de `freeShipBar()`, nos dois lugares (`renderDrawer()` e `pageCart()`), acrescentar
    `window.Melhorias?.completarFrete() || ''`. Ex.: `freeShipBar() + (window.Melhorias?.completarFrete() || '') + cart.map(...)`.
16. Frete na página de produto (submit `shipcalc`):
    - depois da linha `if (!end) { ... CEP não encontrado ... return; }`: `window.Melhorias?.cepCalculado(cep, end);`
    - no resultado: `<span class="muted">· ${esc(o.prazo)}</span>` → `<span class="muted">· ${esc(o.prazo)}</span>${window.Melhorias?.chegaAte(o.prazo) || ''}`

## E. Roteador, pagamento e compra (medição)

17. Em `route()`, logo depois de `after && after();`: `  window.Melhorias?.rota(parts);`
18. Em `finalizar()`, depois de `const metodo = ck.metodo;`: `  window.Melhorias?.aoPagar(metodo);`
19. Em `concluirPedido(order)`, como primeira linha: `  window.Melhorias?.aoConcluir(order);`

## Nomes que as melhorias usam do código da loja
`CONFIG`, `CORES`, `MODELOS`, `PRODUTOS`, `Tee` (com `Tee.frente`, `Tee.lum` e o `clipPath id="teeclip"`),
`sel`, `cart`, `ck`, `prodById`, `BRL`, `esc`, `store`, `toast`, `waLink`, `digits`, `parcelas`, `totals`,
`unitPrice`, `opcoesFrete`, `fotoHTML`, `refreshProduct`, e as classes/ids `#gal`, `.gal-i[data-v]`,
`.gal-m`, `.buy-row`, `.pdp2`, `#sizes`, `[data-perso]`, `[data-form="shipcalc"]`, `.logo-img`,
`.destaque .d-b`, `.destaque .d-a`, `.ocasiao`, `.wpp-float`. Se algum foi renomeado, ajuste no `melhorias.js`.
