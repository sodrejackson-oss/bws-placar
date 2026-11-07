Vou te passar um pacote de melhorias de conversão para o site da BBS Store, feito e testado em outra conversa a partir de uma versão anterior deste mesmo site. Quero que você **encaixe essas melhorias na versão atual do site**, sem substituir o que já existe e sem reescrever as melhorias.

**Arquivos anexados**
- `melhorias.js`: todas as melhorias, num objeto `Melhorias`. Use como está.
- `melhorias.css`: os estilos delas.
- `camisa3d.js`: a camisa 3D (Three.js, carregado do jsDelivr).
- `ganchos.md`: os 19 pontos do código da loja que chamam as melhorias, cada um com o trecho de antes e o de depois.

**O que as melhorias fazem**
1. Camisa 3D na página de produto, numa aba "Sua camisa em 3D" ao lado da foto. Mostra a personalização ao vivo e vira para o lado certo quando a pessoa foca um campo. No celular, flutua no canto enquanto ela digita. Sem WebGL, voltam as prévias planas de hoje.
2. Botão "Mandar a prévia para alguém": gera uma imagem da camisa personalizada para o WhatsApp.
3. "Qual é o meu tamanho?": sugere o tamanho por altura, peso e caimento (ou idade, no infantil).
4. Prazo com data ("Peça hoje e ela fica pronta até seg, 16/11"), e a data de chegada depois do CEP.
5. Barra fixa de compra no celular. O botão do WhatsApp sai da frente do "Adicionar à sacola".
6. A personalização fica guardada se a pessoa sair e voltar.
7. Sacola: "Com mais uma, o frete sai grátis", com duas sugestões.
8. Kit do time: lista de jogadores, colar a lista do grupo, total com desconto por quantidade e envio no WhatsApp.
9. Início: fotos em profundidade atrás de "Produção própria" e foto que segue o mouse em "Compre por ocasião".
10. Eventos de e-commerce para o Google Tag Manager, o gtag e o Meta Pixel.

**Como encaixar**
1. Siga o `ganchos.md` ponto a ponto. Se algum trecho estiver diferente na versão atual (porque o site mudou depois), encaixe a chamada no lugar equivalente e me diga onde foi.
2. Mantendo o site num HTML único: cole `melhorias.css` num `<style>` no fim do `<head>`; `melhorias.js` num `<script>` **antes** do script do app e depois dos scripts do catálogo e do `Tee`; e `camisa3d.js` num `<script type="module" data-bbs3d>` antes do `</body>`. A ordem importa: as melhorias precisam vir antes do app.
3. O ponto 13 do `ganchos.md` também corrige um defeito do código atual: em `validateSel()`, `classList.toggle('invalid', bad)` recebe `undefined` em campo opcional e alterna a marcação de erro a cada clique. A correção é `!!bad`.
4. O `melhorias.js` usa nomes do código da loja (lista no fim do `ganchos.md`). Se algum foi renomeado nesta versão, ajuste no `melhorias.js`, sem mudar o comportamento.
5. Não mude textos, cores, preços nem regras da loja além do que os ganchos pedem.

**Valores para eu confirmar** (estão em `MELHORIAS_CONFIG`, no topo do `melhorias.js`; não mude sem me perguntar)
- `kitDescontos`: hoje 10% a partir de 10 camisas e 15% a partir de 20 (exemplo).
- `diasAprovacaoArte`: 1 dia útil para enviar e aprovar a arte antes da produção.
- A regra de `sugerirTamanho()` é uma referência inicial.

**Depois de encaixar, confira e me conte o resultado de cada item**
- Página de produto da Geração Futebol: aba "Sua camisa em 3D", o ano digitado aparecendo na frente e o nome nas costas.
- Coleção Posição: escolher a posição muda a estampa da frente no 3D; nome e número aparecem nas costas.
- "Qual é o meu tamanho?" com 175 cm e 78 kg sugere G, e o botão "Usar G" marca o tamanho.
- Adicionar à sacola sem tamanho: a fileira de tamanhos treme e a página rola até ela.
- Campo opcional preenchido não fica vermelho ao adicionar à sacola.
- Sacola com uma camisa: aparecem as duas sugestões para o frete grátis.
- Kit do time: colar `DAVI 10 M` e `GABRIEL 7 infantil 12` cria duas linhas com tamanhos certos.
- Console do navegador sem erros novos.
