# BBS Store: melhorias de conversão

Versão da prévia da BBS Store com melhorias focadas em converter mais.
O código original da loja foi mantido. As melhorias ficam em arquivos próprios e
entram por pequenos "ganchos" (procure `Melhorias` no `index.html`).

## Arquivos
| arquivo | o que é |
|---|---|
| `index.html` | a loja original, com as imagens fora do HTML e os ganchos |
| `js/melhorias.js` | todas as melhorias (configuração no topo: `MELHORIAS_CONFIG`) |
| `css/melhorias.css` | estilos das melhorias |
| `js/camisa3d.js` | a camisa 3D, com o Three.js embutido. Só carrega na página de produto. |
| `fonte/` | código-fonte da camisa 3D e o comando para gerar `js/camisa3d.js` |
| `img/` | as fotos, em WebP |

Para testar: sirva a pasta (ex.: `python3 -m http.server`) e abra no navegador.
Abrir o arquivo direto (`file://`) não carrega o 3D.

## O que mudou
1. **Velocidade.** O HTML caiu de 1,7 MB para cerca de 135 KB: as 26 imagens embutidas viraram
   11 arquivos WebP (436 KB no total), baixados aos poucos e guardados em cache.
2. **Camisa 3D na página de produto.** Aba "Sua camisa em 3D" ao lado da foto, para os produtos
   com prévia ou costas. Mostra a personalização ao vivo. Ao focar um campo, a camisa vira para o
   lado certo (nome e número → costas). No celular, ela flutua no canto enquanto a pessoa digita.
   Sem WebGL, voltam as prévias planas de antes.
3. **"Mandar a prévia para alguém".** Gera uma imagem com frente, costas, personalização e preço.
   No celular abre o compartilhamento nativo; no computador mostra a imagem e um link do WhatsApp.
4. **"Qual é o meu tamanho?"** Altura, peso e caimento (ou idade, no infantil) → tamanho sugerido,
   com botão para usar. A regra está em `sugerirTamanho()`: é uma referência inicial, calibre com
   as trocas reais.
5. **Prazo com data.** "Peça hoje e ela fica pronta até seg, 16/11". Depois que a pessoa informa o
   CEP uma vez, mostra "receba em Florianópolis até sex, 20/11" em todos os produtos.
   O cálculo de frete também ganhou a data de chegada.
6. **Barra de compra fixa no celular** quando o botão "Adicionar à sacola" sai da tela.
   O botão do WhatsApp sai da frente do botão de compra.
7. **Personalização guardada.** Quem sai e volta encontra nome, número, modelo e tamanho preenchidos.
8. **Sacola: "Com mais uma, o frete sai grátis"**, com duas sugestões que fecham o valor.
9. **Kit do time.** Lista de jogadores (nome, número, tamanho), opção de colar a lista do grupo,
   total com desconto por quantidade e envio organizado no WhatsApp.
   Os descontos (`kitDescontos`) são **exemplo**: ajuste antes de publicar.
10. **Início:** fotos em profundidade atrás de "Produção própria" e foto que segue o cursor em
    "Compre por ocasião" (só com mouse).
11. **Medição.** Eventos no `dataLayer` (Google Tag Manager), no `gtag` e no `fbq` (Meta Pixel), se
    estiverem instalados: `view_item`, `customize_start`, `view_3d`, `view_3d_tab`, `size_recommend`,
    `share_preview`, `kit_open`, `kit_whatsapp`, `add_to_cart`, `select_item`, `begin_checkout`,
    `add_shipping_info`, `add_payment_info`, `purchase`.
    Para ver no console: `localStorage.bbs_debug = 'true'`.

## Correções no código original
- **Campo opcional marcado como obrigatório.** Em `validateSel()`, `classList.toggle('invalid', bad)`
  recebia `undefined` em campos opcionais e alternava a marcação a cada clique. Agora usa `!!bad`.

## Antes de publicar
- Ajustar `kitDescontos` e `diasAprovacaoArte` em `MELHORIAS_CONFIG`.
- Conferir a regra do recomendador de tamanho com a tabela de medidas real.
- Instalar o Google Tag Manager e/ou o Meta Pixel para os eventos serem registrados.
- Produtos novos sem arte desenhada: adicionar em `estampaDaFoto` o recorte da estampa na foto
  (x, y, largura, altura em %), para a frente da camisa 3D.

## Gerar `js/camisa3d.js` de novo
Depois de mudar `fonte/camisa3d.js`, na raiz do repositório:
`npx vite build --config bbs/fonte/vite.config.js`

## Levar para outra versão do site
A pasta `pacote/` tem o prompt (`PROMPT.md`), as instruções de encaixe (`ganchos.md`) e os três arquivos
(`melhorias.js`, `melhorias.css` e `camisa3d.js`, que baixa o Three.js do jsDelivr). Funciona com o site
num HTML único ou em arquivos separados.
