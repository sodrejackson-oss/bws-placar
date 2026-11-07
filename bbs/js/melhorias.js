/* ============================================================
   BBS Store: melhorias de conversão
   Carregado antes do app. O app chama `Melhorias.*` em poucos
   pontos (procure por "Melhorias" no index.html).

   1. Camisa 3D com a personalização ao vivo (+ prévia flutuante no celular)
   2. "Mandar a prévia": imagem pronta para o WhatsApp
   3. Recomendador de tamanho
   4. Prazo com data ("chega até qui, 14/11")
   5. Barra de compra fixa no celular e personalização guardada
   6. Sacola: sugestões para completar o frete grátis
   7. Kit do time: lista de jogadores com desconto por quantidade
   8. Início: fotos em profundidade e foto que segue o cursor
   9. Medição: eventos de e-commerce (GA4 / Meta Pixel / dataLayer)
   ============================================================ */

const MELHORIAS_CONFIG = {
  // Desconto por quantidade no kit do time (exemplo: ajuste antes de publicar)
  kitDescontos: [{ min: 20, pct: 0.15 }, { min: 10, pct: 0.10 }],
  diasAprovacaoArte: 1, // dias úteis para enviar e aprovar a arte, antes da produção
  // Onde está a estampa em cada foto (x, y, largura, altura em %) para a frente da camisa 3D
  estampaDaFoto: {
    'eu-escolhi-ser-goleiro': [28, 24, 40, 52],
    'viciados-para-jogar': [17, 26, 66, 34],
    'colecao-posicao': {
      ATACANTE: [5, 14, 28, 29], MEIA: [37, 14, 28, 29], ZAGUEIRO: [69, 14, 28, 29],
      LATERAL: [5, 54, 28, 29], VOLANTE: [37, 54, 28, 29],
    },
  },
};

const Melhorias = (() => {
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const celular = () => matchMedia('(max-width: 760px)').matches;
  const ponteiroFino = matchMedia('(pointer: fine)').matches;

  /* ============ 9. medição ============ */
  const FB = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', add_payment_info: 'AddPaymentInfo', purchase: 'Purchase' };
  window.dataLayer = window.dataLayer || [];
  function track(evento, dados = {}) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: evento, ...dados });
    try { window.gtag && gtag('event', evento, dados.ecommerce || dados); } catch {}
    try { window.fbq && FB[evento] && fbq('track', FB[evento], { currency: 'BRL', value: dados.ecommerce?.value }); } catch {}
    if (store.get('debug')) console.info('[evento]', evento, dados);
  }
  const itemGA = (p, qtd = 1, extra = {}) => ({ item_id: p.id, item_name: p.nome, price: p.preco, quantity: qtd, ...extra });
  const ecommerce = (itens, value) => ({ ecommerce: { currency: 'BRL', value: +value.toFixed(2), items: itens } });

  /* ============ datas ============ */
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function maisDiasUteis(n, de = new Date()) {
    const d = new Date(de);
    if (d.getHours() >= 15) n += 1; // pedido depois das 15h entra no dia seguinte
    while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; }
    return d;
  }
  const dataCurta = (d) => `${DIAS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const faixa = (txt) => (String(txt).match(/(\d+)\s*a\s*(\d+)/) || []).slice(1).map(Number);
  // "8 a 12 dias úteis" (prazo do frete, já com produção) → "chega até qua, 20/11"
  function chegaAte(prazo) {
    const [, max] = faixa(prazo);
    if (!max) return '';
    return ` <b class="chega">chega até ${dataCurta(maisDiasUteis(max + MELHORIAS_CONFIG.diasAprovacaoArte))}</b>`;
  }

  /* ============ 1. arte da camisa em canvas (mesma lógica da prévia SVG) ============ */
  let SHAPE = null;
  const shape = () => SHAPE || (SHAPE = Tee.frente(PRODUTOS[0], PRODUTOS[0].cores[0]).match(/<clipPath id="teeclip"><path d="([^"]+)"/)[1]);
  const fontes = Promise.all([
    document.fonts?.load('900 52px Anton'), document.fonts?.load('700 26px "Kaushan Script"'),
  ].filter(Boolean)).catch(() => {});
  const imgs = new Map();
  function imagem(src, aoCarregar) {
    if (!imgs.has(src)) {
      const im = new Image();
      im.onload = () => aoCarregar && aoCarregar();
      im.src = src;
      imgs.set(src, im);
    }
    const im = imgs.get(src);
    return im.complete && im.naturalWidth ? im : null;
  }
  function contraste(a, b) {
    const [x, y] = [Tee.lum(a), Tee.lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  }
  const legivel = (cor, malha) => contraste(cor, malha) >= 2.2 ? cor : (Tee.lum(malha) > 0.4 ? '#141414' : '#f4f4f2');
  const DEF = { nome: 'SEU NOME', numero: '10', ano: '2016', posicao: 'ATACANTE', nick: 'SEU NICK' };
  const preencher = (t, p) => String(t).replace(/\{(\w+)\}/g, (_, k) => (p[k] && String(p[k]).trim()) || DEF[k] || '');

  function texto(ctx, t, x, y, tam, cor, { fonte = 'display', peso = 900, max = 150, borda, espaco = 0.5 } = {}) {
    const fam = fonte === 'script' ? "'Kaushan Script', cursive" : 'Anton, Impact, sans-serif';
    ctx.font = `${peso} ${tam}px ${fam}`;
    ctx.letterSpacing = `${espaco}px`;
    const w = ctx.measureText(t).width;
    if (w > max) { tam = Math.max(10, Math.floor(tam * max / w)); ctx.font = `${peso} ${tam}px ${fam}`; }
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (borda) { ctx.lineWidth = 3; ctx.strokeStyle = borda; ctx.lineJoin = 'round'; ctx.strokeText(t, x, y); }
    ctx.fillStyle = cor; ctx.fillText(t, x, y);
    ctx.letterSpacing = '0px';
  }

  function estampaDaFoto(ctx, p, perso, redesenhar) {
    let r = MELHORIAS_CONFIG.estampaDaFoto[p.id];
    if (!r) return false;
    if (!Array.isArray(r)) r = r[perso.posicao] || Object.values(r)[0];
    const im = imagem(p.foto, redesenhar);
    if (!im) return true;
    const [x, y, w, h] = r;
    const sx = im.naturalWidth * x / 100, sy = im.naturalHeight * y / 100;
    const sw = im.naturalWidth * w / 100, sh = im.naturalHeight * h / 100;
    const dw = 158, dh = Math.min(200, dw * sh / sw), dW = dh * sw / sh;
    const off = document.createElement('canvas');
    off.width = Math.round(dW * 4); off.height = Math.round(dh * 4);
    const o = off.getContext('2d');
    o.drawImage(im, sx, sy, sw, sh, 0, 0, off.width, off.height);
    // borda esfumada para a foto se fundir na malha
    o.globalCompositeOperation = 'destination-in';
    const g = o.createRadialGradient(off.width / 2, off.width / 2, 0, off.width / 2, off.width / 2, off.width / 2); // círculo achatado para a elipse da foto
    g.addColorStop(0.72, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
    o.setTransform(1, 0, 0, off.height / off.width, 0, 0);
    o.fillStyle = g; o.fillRect(0, 0, off.width, off.width);
    ctx.drawImage(off, 150 - dW / 2, 62, dW, dh);
    return true;
  }

  function desenharLado(canvas, lado, p, corId, perso, redesenhar) {
    const ctx = canvas.getContext('2d');
    const K = canvas.width / 300;
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.clearRect(0, 0, 300, 320);
    const malha = CORES[corId].hex;
    const claro = Tee.lum(malha) > 0.4;
    const forma = new Path2D(shape());
    ctx.fillStyle = malha; ctx.fill(forma);
    ctx.save(); ctx.clip(forma);
    // costuras das mangas e da barra
    ctx.strokeStyle = claro ? '#00000014' : '#ffffff10'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(60, 110); ctx.lineTo(38, 46); ctx.moveTo(240, 110); ctx.lineTo(262, 46);
    ctx.moveTo(60, 296); ctx.quadraticCurveTo(150, 306, 240, 296); ctx.stroke(); ctx.setLineDash([]);

    if (lado === 'frente') {
      const a = p.arte;
      if (a) {
        if (a.faixa) { ctx.fillStyle = a.faixa[0]; ctx.fillRect(88, 40, 16, 262); ctx.globalAlpha = 0.9; ctx.fillStyle = legivel(a.faixa[1], malha); ctx.fillRect(104, 40, 7, 262); ctx.globalAlpha = 1; }
        (a.listras || []).forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(100 + i * 25, 98, 21, 96); });
        if (a.foto) {
          const im = perso.fotoData && imagem(perso.fotoData, redesenhar);
          ctx.save(); ctx.beginPath(); ctx.arc(150, 150, 46, 0, Math.PI * 2);
          if (im) {
            ctx.clip();
            const k = Math.max(92 / im.naturalWidth, 92 / im.naturalHeight);
            ctx.drawImage(im, 150 - im.naturalWidth * k / 2, 150 - im.naturalHeight * k / 2, im.naturalWidth * k, im.naturalHeight * k);
          } else { ctx.fillStyle = '#ffffffd9'; ctx.fill(); texto(ctx, 'foto do pet', 150, 154, 11, '#66625a', { peso: 400, espaco: 0 }); }
          ctx.restore();
        }
        (a.linhas || []).forEach((l) => {
          const t = preencher(l.t, perso);
          if (!t.trim()) return;
          texto(ctx, t, 150, l.y, l.s, l.borda ? l.c : legivel(l.c, malha), { fonte: l.fonte, peso: l.w, borda: l.borda, espaco: l.fonte === 'script' ? 0 : 0.5 });
        });
      } else {
        estampaDaFoto(ctx, p, perso, redesenhar);
      }
    } else {
      const tinta = claro ? '#141414' : '#f4f4f2';
      const nome = String(perso.nome || perso.nick || '').trim().toUpperCase();
      const num = String(perso.numero || '').trim();
      if (!nome && !num) {
        ctx.globalAlpha = 0.45; texto(ctx, 'digite o nome para ver aqui', 150, 170, 11, tinta, { fonte: 'display', peso: 400, espaco: 0.3 }); ctx.globalAlpha = 1;
      } else {
        if (nome) texto(ctx, nome, 150, num ? 108 : 160, 26, tinta, { espaco: 1.5 });
        if (num) texto(ctx, num, 150, 215, 92, tinta, { max: 160 });
      }
    }
    ctx.restore();
    // gola
    ctx.strokeStyle = claro ? '#00000026' : '#ffffff26';
    ctx.lineWidth = lado === 'frente' ? 6 : 5;
    ctx.beginPath(); ctx.moveTo(98, 22); ctx.quadraticCurveTo(150, lado === 'frente' ? 58 : 34, 202, 22); ctx.stroke();
  }

  /* ============ 1. camisa 3D ============ */
  let webgl = null;
  const temWebGL = () => {
    if (webgl === null) {
      try { webgl = !!document.createElement('canvas').getContext('webgl2'); } catch { webgl = false; }
    }
    return webgl;
  };
  const usa3D = (p) => !!((p.previa || p.costas) && temWebGL() && window.ResizeObserver);

  const c3d = { prod: null, frente: null, costas: null, cena: null, carregando: null, figura: null };
  function telas(K = 3) {
    if (!c3d.frente) {
      c3d.frente = document.createElement('canvas'); c3d.costas = document.createElement('canvas');
      [c3d.frente, c3d.costas].forEach((c) => { c.width = 300 * K; c.height = 320 * K; });
    }
  }
  function redesenhar() {
    const p = prodById(sel.id);
    telas();
    desenharLado(c3d.frente, 'frente', p, sel.cor, sel.perso, redesenhar);
    desenharLado(c3d.costas, 'costas', p, sel.cor, sel.perso, redesenhar);
    c3d.cena && c3d.cena.atualizar();
  }

  // O módulo 3D pode vir colado no HTML (<script type="module" data-bbs3d>) ou como arquivo js/camisa3d.js.
  function carregar3D() {
    if (window.BBS3D) return Promise.resolve(window.BBS3D);
    if (document.querySelector('script[data-bbs3d]')) {
      return new Promise((ok) => addEventListener('bbs3d-pronto', () => ok(window.BBS3D), { once: true }));
    }
    // a página ainda está carregando: a tag do 3D pode estar mais abaixo no HTML
    if (document.readyState === 'loading') {
      return new Promise((ok) => document.addEventListener('DOMContentLoaded', ok, { once: true })).then(carregar3D);
    }
    return import('./camisa3d.js');
  }
  function montar3D(p) {
    const fig = document.querySelector('.gal-i[data-v="3d"]');
    if (!fig || fig.dataset.pronta) return;
    fig.dataset.pronta = '1';
    c3d.figura = fig;
    const m = fig.querySelector('.gal-m');
    m.innerHTML = `<div class="c3d" aria-label="Sua camisa em 3D. Arraste para girar." role="img">
        <div class="c3d-palco"></div>
        <div class="c3d-carregando">Montando a sua camisa…</div>
      </div>
      <div class="c3d-lados" role="group" aria-label="Ver lado">
        <button type="button" data-m="lado" data-v="frente" aria-pressed="true">Frente</button>
        <button type="button" data-m="lado" data-v="costas" aria-pressed="false">Costas</button>
      </div>
      <span class="c3d-dica">arraste para girar</span>`;
    redesenhar();
    fontes.then(redesenhar);
    const palco = m.querySelector('.c3d-palco');
    c3d.carregando = carregar3D().then(({ criarCamisa3D }) => {
      if (!document.body.contains(palco)) return;
      c3d.cena = criarCamisa3D(palco, {
        shape: shape(), frente: c3d.frente, costas: c3d.costas,
        aoInteragir: () => track('view_3d', { item_id: p.id }),
      });
      m.querySelector('.c3d').classList.add('ok');
    }).catch((erro) => {
      console.warn('[BBS] camisa 3D indisponível, usando as prévias planas:', erro);
      // sem 3D: volta para as prévias planas
      webgl = false; delete fig.dataset.pronta; refreshProductCompleto();
    });
  }
  function refreshProductCompleto() { const g = document.querySelector('#gal'); if (g) g.dataset.prod = ''; refreshProduct(); }

  function virar(lado) {
    if (!c3d.cena) return;
    c3d.cena.virar(lado);
    document.querySelectorAll('.c3d-lados button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === lado)));
  }

  // Galeria em abas: Foto | Em 3D. Ao começar a personalizar, mostra o 3D.
  function abas(p) {
    const gal = document.querySelector('#gal');
    if (!gal || !usa3D(p) || gal.querySelector('.gal-abas')) return;
    gal.insertAdjacentHTML('afterbegin', `<div class="gal-abas" role="tablist">
      <button role="tab" data-m="aba" data-v="foto" aria-selected="true">Foto</button>
      <button role="tab" data-m="aba" data-v="3d" aria-selected="false"><span class="bolinha"></span>Sua camisa em 3D</button>
    </div>`);
    mostrarAba('foto');
  }
  function mostrarAba(v) {
    const gal = document.querySelector('#gal');
    if (!gal) return;
    gal.dataset.aba = v;
    gal.querySelectorAll('.gal-abas button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.v === v)));
    if (v === '3d') c3d.cena?.medir();
  }

  // No celular, enquanto digita, a camisa flutua no canto para a pessoa ver o resultado.
  function flutuar(ligar) {
    const st = document.querySelector('.c3d');
    if (!st) return;
    const gal = document.querySelector('#gal');
    const foraDaTela = gal && gal.getBoundingClientRect().bottom < 80;
    st.classList.toggle('flutua', !!(ligar && celular() && foraDaTela));
    c3d.cena?.medir();
  }

  /* ============ 2. mandar a prévia ============ */
  async function gerarImagemPrevia(p) {
    telas(); redesenhar(); await fontes;
    const W = 1080, H = 1350, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1d1a14'); g.addColorStop(1, '#0d0c09');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const luz = x.createRadialGradient(W / 2, 560, 50, W / 2, 560, 620);
    luz.addColorStop(0, '#f5961f40'); luz.addColorStop(1, '#f5961f00');
    x.fillStyle = luz; x.fillRect(0, 0, W, H);
    const logo = imagem(document.querySelector('.logo-img')?.src || ''); // a logo da própria página
    if (logo) x.drawImage(logo, 70, 64, 110, 110);
    x.fillStyle = '#fff'; x.font = '800 54px Sora, Figtree, sans-serif'; x.textAlign = 'left';
    x.fillText(p.nome, 210, 118);
    x.fillStyle = '#f9b233'; x.font = '700 30px Figtree, sans-serif';
    x.fillText('Feita para você · prévia', 210, 160);
    const temCostas = p.costas && (sel.perso.nome || sel.perso.numero || sel.perso.nick);
    const lados = temCostas ? [c3d.frente, c3d.costas] : [c3d.frente];
    const lw = temCostas ? 470 : 760, lh = lw * 320 / 300;
    lados.forEach((cv, i) => {
      const lx = temCostas ? 60 + i * 490 : (W - lw) / 2;
      x.save(); x.shadowColor = '#0009'; x.shadowBlur = 50; x.shadowOffsetY = 24;
      x.drawImage(cv, lx, 230, lw, lh); x.restore();
      if (temCostas) { x.fillStyle = '#ffffff99'; x.font = '600 26px Figtree, sans-serif'; x.textAlign = 'center'; x.fillText(i ? 'costas' : 'frente', lx + lw / 2, 230 + lh + 40); }
    });
    const resumo = resumoPerso(p);
    x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = '700 40px Figtree, sans-serif';
    if (resumo) x.fillText(resumo.slice(0, 44), 70, H - 190);
    x.fillStyle = '#f9b233'; x.font = '800 44px Sora, Figtree, sans-serif';
    x.fillText(`${BRL(precoAtual(p) * (1 - CONFIG.pixDesconto))} no Pix`, 70, H - 120);
    x.fillStyle = '#ffffffb3'; x.font = '600 28px Figtree, sans-serif';
    x.fillText(`@${CONFIG.instagram} · você aprova a arte antes da produção`, 70, H - 66);
    return c;
  }
  const precoAtual = (p) => p.preco + (MODELOS[sel.modelo]?.acrescimo || 0);
  function resumoPerso(p) {
    return (p.personalizacao || []).filter((f) => f.tipo !== 'file' && sel.perso[f.campo])
      .map((f) => String(sel.perso[f.campo]).toUpperCase()).join(' · ');
  }
  async function compartilhar(p) {
    const canvas = await gerarImagemPrevia(p);
    const link = location.href.split('#')[0] + `#/p/${p.id}`;
    const texto = `Olha como ficou a minha ${p.nome}${resumoPerso(p) ? ` (${resumoPerso(p)})` : ''}! O que acha? ${link}`;
    track('share_preview', { item_id: p.id });
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const arquivo = blob && new File([blob], `bbs-${p.id}.png`, { type: 'image/png' });
    try {
      if (arquivo && navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], text: texto, title: p.nome });
        return;
      }
    } catch (e) { if (e?.name === 'AbortError') return; }
    // sem compartilhamento nativo: mostra a imagem e o link do WhatsApp
    const url = canvas.toDataURL('image/png');
    modal(`<h3>Sua prévia está pronta</h3>
      <img class="previa-img" src="${url}" alt="Prévia da ${esc(p.nome)} personalizada">
      <p class="muted">No celular, toque e segure na imagem para salvar. No computador, clique com o botão direito e escolha "Salvar imagem".</p>
      <a class="btn btn-wpp btn-block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(texto)}">Mandar no WhatsApp</a>`);
  }

  function modal(html) {
    let m = document.querySelector('#mModal');
    if (!m) {
      document.body.insertAdjacentHTML('beforeend', `<div class="m-modal" id="mModal" role="dialog" aria-modal="true" hidden><div class="m-caixa"><button class="icon-btn m-fechar" data-m="fechar" aria-label="Fechar">✕</button><div class="m-corpo"></div></div></div>`);
      m = document.querySelector('#mModal');
      m.addEventListener('click', (e) => { if (e.target === m) m.hidden = true; });
    }
    m.querySelector('.m-corpo').innerHTML = html;
    m.hidden = false;
    m.querySelector('.m-fechar').focus();
  }

  /* ============ 3. recomendador de tamanho ============ */
  // Referência inicial pelo peso e altura; calibre com as trocas reais da loja.
  function sugerirTamanho(modelo, { altura, peso, idade, caimento }) {
    const ordem = MODELOS[modelo].tamanhos;
    let i;
    if (modelo === 'infantil') {
      i = ordem.findIndex((t) => +t >= idade + (idade % 2 ? 1 : 0));
      if (i < 0) i = ordem.length - 1;
    } else {
      const base = peso + (altura - 170) * 0.35;
      const cortes = modelo === 'babylook' ? [54, 63, 73] : [64, 76, 88, 100];
      i = cortes.findIndex((c) => base < c);
      if (i < 0) i = ordem.length - 1;
    }
    i += caimento === 'folgado' ? 1 : caimento === 'justo' ? -1 : 0;
    return ordem[Math.max(0, Math.min(ordem.length - 1, i))];
  }
  function painelTamanho() {
    const box = document.querySelector('#tamAjuda');
    if (!box) return;
    if (!box.hidden) { box.hidden = true; return; }
    const inf = sel.modelo === 'infantil';
    const guardado = store.get('medidas', {});
    box.innerHTML = `<form data-m-form="tamanho" class="tam-form">
      ${inf ? `<label>Idade da criança<input name="idade" inputmode="numeric" maxlength="2" value="${esc(guardado.idade || '')}" placeholder="8" required></label>`
            : `<label>Altura (cm)<input name="altura" inputmode="numeric" maxlength="3" value="${esc(guardado.altura || '')}" placeholder="172" required></label>
               <label>Peso (kg)<input name="peso" inputmode="numeric" maxlength="3" value="${esc(guardado.peso || '')}" placeholder="70" required></label>`}
      <label>Como gosta de usar<select name="caimento"><option value="normal">Normal</option><option value="justo">Mais justa</option><option value="folgado">Mais folgada</option></select></label>
      <button class="btn btn-ghost">Ver meu tamanho</button>
    </form><div class="tam-res" id="tamRes" aria-live="polite"></div>`;
    box.hidden = false;
    box.querySelector('input')?.focus();
  }
  function responderTamanho(form) {
    const d = Object.fromEntries(new FormData(form));
    const v = { altura: +d.altura, peso: +d.peso, idade: +d.idade, caimento: d.caimento };
    if (sel.modelo === 'infantil' ? !(v.idade > 0 && v.idade < 16) : !(v.altura > 120 && v.peso > 30)) { toast('Confira os números'); return; }
    store.set('medidas', { ...store.get('medidas', {}), ...d });
    const t = sugerirTamanho(sel.modelo, v);
    track('size_recommend', { item_id: sel.id, tamanho: t, modelo: sel.modelo });
    document.querySelector('#tamRes').innerHTML = `<div class="tam-ok"><span>Para você: <b>${t}</b> (${MODELOS[sel.modelo].nome}). Na dúvida, compare com uma camisa sua na <a href="#/ajuda/medidas">tabela de medidas</a>.</span>
      <button class="btn btn-gold" data-m="usar-tam" data-v="${t}">Usar ${t}</button></div>`;
  }

  /* ============ 4. prazo com data ============ */
  async function prazoProduto() {
    const box = document.querySelector('#entregaPrev');
    if (!box) return;
    const [, maxProd] = faixa(CONFIG.prazoProducao);
    const pronta = maisDiasUteis(maxProd + MELHORIAS_CONFIG.diasAprovacaoArte);
    const end = store.get('cepInfo', null);
    if (end && end.uf) {
      const ops = opcoesFrete(end).filter((o) => o.id !== 'retirada');
      const [pac, sedex] = ops;
      const d = (o) => dataCurta(maisDiasUteis(faixa(o.prazo)[1] + MELHORIAS_CONFIG.diasAprovacaoArte));
      box.innerHTML = `<span class="ic">⏱</span><span>Peça hoje e receba em <b>${esc(end.cidade || end.uf)}</b> até <b>${d(pac)}</b>${sedex ? `, ou até <b>${d(sedex)}</b> com SEDEX` : ''}. <button class="link" data-m="trocar-cep">trocar CEP</button></span>`;
    } else {
      box.innerHTML = `<span class="ic">⏱</span><span>Peça hoje e ela fica pronta até <b>${dataCurta(pronta)}</b>. <button class="link" data-m="trocar-cep">Ver quando chega na sua casa</button></span>`;
    }
  }

  /* ============ 5. barra fixa no celular + personalização guardada ============ */
  let obsCompra = null;
  function barraCompra(p) {
    let bar = document.querySelector('#barraCompra');
    if (!bar) {
      document.body.insertAdjacentHTML('beforeend', `<div class="barra-compra" id="barraCompra" aria-hidden="true">
        <div class="bc-preco"><b></b><small></small></div>
        <button class="btn btn-gold" data-action="add">Adicionar à sacola</button></div>`);
      bar = document.querySelector('#barraCompra');
    }
    const preco = precoAtual(p);
    bar.querySelector('b').textContent = BRL(preco * (1 - CONFIG.pixDesconto)) + ' no Pix';
    bar.querySelector('small').textContent = `ou ${BRL(preco)} em até ${parcelas(preco).pop().n}x`;
    const alvo = document.querySelector('.buy-row');
    if (obsCompra) obsCompra.disconnect();
    if (!alvo) return;
    obsCompra = new IntersectionObserver(([e]) => {
      // o botão do WhatsApp sai da frente enquanto o "Adicionar à sacola" está na tela
      document.body.classList.toggle('cta-na-tela', e.isIntersecting);
      const mostrar = !e.isIntersecting && e.boundingClientRect.top < innerHeight && document.querySelector('.pdp2');
      bar.classList.toggle('on', !!mostrar);
      bar.setAttribute('aria-hidden', String(!mostrar));
      document.body.classList.toggle('com-barra', !!mostrar);
    });
    obsCompra.observe(alvo);
  }
  function esconderBarra() {
    obsCompra?.disconnect();
    document.querySelector('#barraCompra')?.classList.remove('on');
    document.body.classList.remove('com-barra', 'cta-na-tela');
  }

  const chaveSel = (id) => 'sel_' + id;
  function restaurar(id) {
    const s = store.get(chaveSel(id), null);
    const p = prodById(id);
    if (!s || !p) return null;
    return {
      id, cor: p.cores.includes(s.cor) ? s.cor : p.cores[0],
      modelo: MODELOS[s.modelo] ? s.modelo : 'adulto',
      tamanho: s.tamanho || null, qtd: 1, perso: s.perso || {},
    };
  }
  let guardarTimer = 0;
  function guardar() {
    clearTimeout(guardarTimer);
    guardarTimer = setTimeout(() => {
      if (!sel) return;
      const { fotoData, ...perso } = sel.perso; // a foto do pet não fica guardada
      store.set(chaveSel(sel.id), { cor: sel.cor, modelo: sel.modelo, tamanho: sel.tamanho, perso });
    }, 300);
  }
  function preencherCampos() {
    Object.entries(sel.perso).forEach(([k, v]) => {
      const el = document.querySelector(`[data-perso="${k}"]`);
      if (el && v != null) el.value = v;
    });
  }

  /* ============ 6. sacola: completar o frete grátis ============ */
  function completarFrete() {
    if (!cart.length) return '';
    const falta = CONFIG.freteGratisAcima - totals(null, null).base;
    if (falta <= 0) return '';
    const naSacola = new Set(cart.map((i) => i.id));
    const ultimo = prodById(cart[cart.length - 1].id);
    const sugeridos = PRODUTOS.filter((p) => !naSacola.has(p.id))
      .sort((a, b) => {
        const ca = a.categorias.some((c) => ultimo.categorias.includes(c) && c !== 'presente') ? 0 : 1;
        const cb = b.categorias.some((c) => ultimo.categorias.includes(c) && c !== 'presente') ? 0 : 1;
        return ca - cb || Math.abs(a.preco - falta) - Math.abs(b.preco - falta);
      }).slice(0, 2);
    if (!sugeridos.length) return '';
    return `<div class="completa"><div class="completa-t">Com mais uma, o frete sai <b>grátis</b>:</div>
      ${sugeridos.map((p) => `<a class="completa-i" href="#/p/${p.id}" data-action="closedrawer" data-m="sugestao" data-v="${p.id}">
        <span class="completa-f">${fotoHTML(p)}</span>
        <span><b>${esc(p.nome)}</b><small>${BRL(p.preco * (1 - CONFIG.pixDesconto))} no Pix</small></span><span class="completa-s">ver →</span></a>`).join('')}
    </div>`;
  }

  /* ============ 7. kit do time ============ */
  const kitVazio = () => ({ ano: '', linhas: [{ nome: '', numero: '', tam: '' }, { nome: '', numero: '', tam: '' }, { nome: '', numero: '', tam: '' }] });
  let kit = null;
  const kitCampos = (p) => {
    const c = (p.personalizacao || []).map((f) => f.campo);
    return { numero: c.includes('numero'), ano: c.includes('ano'), posicao: c.includes('posicao') };
  };
  const kitUsa = (p) => !p.categorias.includes('pet');
  function kitDesconto(n) { return MELHORIAS_CONFIG.kitDescontos.find((d) => n >= d.min) || null; }
  function kitAbrir(p) {
    kit = store.get('kit_' + p.id, null) || kitVazio();
    desenharKit(p, true);
    track('kit_open', { item_id: p.id });
  }
  function desenharKit(p, aberto) {
    const box = document.querySelector('#kit');
    if (!box) return;
    const menor = MELHORIAS_CONFIG.kitDescontos.at(-1);
    if (!aberto) {
      box.innerHTML = `<div><b>Monte o kit do time</b><span>Coloque nome, número e tamanho de cada um. A partir de ${menor.min} camisas, ${Math.round(menor.pct * 100)}% off.</span></div>
        <button class="btn btn-ghost" data-m="kit-abrir">Montar a lista</button>`;
      return;
    }
    const cmp = kitCampos(p);
    const opcoes = (atual) => `<option value="">Tamanho</option>` + Object.entries(MODELOS).map(([m, d]) =>
      `<optgroup label="${d.nome}">${d.tamanhos.map((t) => `<option value="${m}:${t}" ${atual === `${m}:${t}` ? 'selected' : ''}>${d.nome === 'Adulto' ? '' : d.nome + ' '}${t}</option>`).join('')}</optgroup>`).join('');
    box.classList.add('kit-aberto');
    box.innerHTML = `<div class="kit-topo"><b>Kit do time: ${esc(p.nome)}</b><button class="link" data-m="kit-fechar">fechar</button></div>
      ${cmp.ano ? `<label class="kit-ano">Ano da turma<input data-k="ano" inputmode="numeric" maxlength="4" value="${esc(kit.ano)}" placeholder="2016"></label>` : ''}
      <div class="kit-tabela" role="table" aria-label="Jogadores">
        <div class="kit-l kit-cab" role="row"><span>Nome nas costas</span>${cmp.numero ? '<span>Nº</span>' : ''}<span>Tamanho</span><span></span></div>
        ${kit.linhas.map((l, i) => `<div class="kit-l" role="row">
          <input data-k="nome" data-i="${i}" maxlength="12" value="${esc(l.nome)}" placeholder="Jogador ${i + 1}" aria-label="Nome do jogador ${i + 1}">
          ${cmp.numero ? `<input data-k="numero" data-i="${i}" inputmode="numeric" maxlength="2" value="${esc(l.numero)}" placeholder="${i + 1}" aria-label="Número do jogador ${i + 1}">` : ''}
          <select data-k="tam" data-i="${i}" aria-label="Tamanho do jogador ${i + 1}">${opcoes(l.tam)}</select>
          <button class="kit-rm" data-m="kit-rm" data-v="${i}" aria-label="Remover jogador ${i + 1}">✕</button></div>`).join('')}
      </div>
      <div class="kit-acoes"><button class="btn btn-ghost" data-m="kit-mais">+ Jogador</button>
        <details class="kit-colar"><summary>Colar a lista do grupo</summary>
          <textarea id="kitTexto" rows="4" placeholder="Uma pessoa por linha, por exemplo:&#10;DAVI 10 M&#10;GABRIEL 7 infantil 12"></textarea>
          <button class="btn btn-ghost" data-m="kit-ler">Ler a lista</button></details></div>
      <div class="kit-resumo" id="kitResumo"></div>`;
    resumoKit(p);
  }
  function resumoKit(p) {
    const el = document.querySelector('#kitResumo');
    if (!el) return;
    const validas = kit.linhas.filter((l) => l.nome.trim() || l.tam);
    const n = validas.length;
    const bruto = validas.reduce((s, l) => s + p.preco + (MODELOS[(l.tam || 'adulto:').split(':')[0]]?.acrescimo || 0), 0);
    const d = kitDesconto(n);
    const total = bruto * (1 - (d?.pct || 0));
    const prox = [...MELHORIAS_CONFIG.kitDescontos].reverse().find((x) => n < x.min);
    el.innerHTML = n ? `<div class="kit-num"><span>${n} ${n === 1 ? 'camisa' : 'camisas'}</span><b>${BRL(total)}</b></div>
      ${d ? `<div class="kit-off">${Math.round(d.pct * 100)}% off por quantidade: você economiza ${BRL(bruto - total)}</div>` : ''}
      ${prox ? `<div class="kit-falta">Faltam ${prox.min - n} para ${Math.round(prox.pct * 100)}% off</div>` : ''}
      <a class="btn btn-wpp btn-block" data-m="kit-enviar" target="_blank" rel="noopener" href="${esc(waLink(mensagemKit(p)))}">Enviar o pedido do time no WhatsApp</a>
      <small class="muted">A gente confere a lista, manda a arte de cada camisa para aprovar e o link de pagamento.</small>`
      : `<small class="muted">Preencha pelo menos um jogador para ver o total.</small>`;
  }
  function lerLista(txt) {
    return txt.split(/\n+/).map((linha) => linha.trim()).filter(Boolean).map((linha) => {
      const tokens = linha.replace(/[,;|\-–]/g, ' ').split(/\s+/);
      const modelo = /infantil|inf\b|crian/i.test(linha) ? 'infantil' : /baby/i.test(linha) ? 'babylook' : 'adulto';
      let numero = '', tam = '', nome = [];
      tokens.forEach((t) => {
        const T = t.toUpperCase().replace(/\.$/, '');
        if (/^(INFANTIL|INF|BABY|LOOK|BABYLOOK|TAM|TAMANHO|N[ºO°]?)$/.test(T)) return;
        if (!tam && ['P', 'M', 'G', 'GG', 'XG'].includes(T) && modelo !== 'infantil') { tam = `${modelo}:${T}`; return; }
        if (/^\d{1,2}$/.test(T)) {
          if (modelo === 'infantil' && !tam && MODELOS.infantil.tamanhos.includes(T) && numero) { tam = `infantil:${T}`; return; }
          if (!numero) { numero = T; return; }
          if (modelo === 'infantil' && !tam && MODELOS.infantil.tamanhos.includes(T)) { tam = `infantil:${T}`; return; }
        }
        nome.push(T);
      });
      // infantil com um número só: é o tamanho ("ANA infantil 8")
      if (!tam && modelo === 'infantil' && MODELOS.infantil.tamanhos.includes(numero)) { tam = `infantil:${numero}`; numero = ''; }
      return { nome: nome.join(' ').slice(0, 12), numero, tam };
    });
  }
  // devolve false (e mostra o problema) se a lista ainda não pode ser enviada
  function kitPronto() {
    const validas = kit.linhas.filter((l) => l.nome.trim() || l.tam);
    if (!validas.length) { toast('Coloque pelo menos um jogador'); return false; }
    const semTam = validas.findIndex((l) => !l.tam);
    if (semTam >= 0) { toast('Falta o tamanho de alguém'); document.querySelectorAll('#kit select[data-k="tam"]')[kit.linhas.indexOf(validas[semTam])]?.focus(); return false; }
    return true;
  }
  function mensagemKit(p) {
    const cmp = kitCampos(p);
    const validas = kit.linhas.filter((l) => l.nome.trim() || l.tam);
    const linhas = validas.map((l, i) => {
      const [m, t] = (l.tam || 'adulto:?').split(':');
      return `${i + 1}. ${l.nome.toUpperCase() || '(sem nome)'}${cmp.numero && l.numero ? ` #${l.numero}` : ''} · ${MODELOS[m].nome} ${t}`;
    });
    const n = validas.length, d = kitDesconto(n);
    const bruto = validas.reduce((s, l) => s + p.preco + (MODELOS[(l.tam || 'adulto:').split(':')[0]].acrescimo || 0), 0);
    return `Olá! Quero o kit do time: *${p.nome}*${cmp.ano && kit.ano ? `, geração ${kit.ano}` : ''}.\n\n${linhas.join('\n')}\n\nTotal: ${n} camisas · ${BRL(bruto * (1 - (d?.pct || 0)))}${d ? ` (com ${Math.round(d.pct * 100)}% off)` : ''}\nPode me mandar a arte para aprovar?`;
  }

  /* ============ 8. início ============ */
  function profundidade() {
    const sec = document.querySelector('.destaque .d-b');
    if (!sec || sec.querySelector('.prof')) return;
    const fotos = [
      ['geracao-futebol', 0, -2, 0.9], ['respeito-e-a-regra', 66, 2, 0.35], ['paixao-pelo-futsal', 82, 76, 0.8],
      ['viciados-para-jogar', 2, 80, 0.3], ['colecao-posicao', 38, -4, 0.15], ['camera-narracao-emocao', 28, 88, 0.55],
      ['eu-escolhi-ser-goleiro', 60, 90, 0.2],
    ];
    sec.insertAdjacentHTML('afterbegin', `<div class="prof" aria-hidden="true">${fotos.map(([f, x, y, z]) =>
      `<img src="${prodById(f)?.foto || ''}" alt="" loading="lazy" style="--x:${x}%;--y:${y}%;--z:${z}" data-z="${z}">`).join('')}</div>`);
    if (reduzido) return;
    const imgsP = [...sec.querySelectorAll('.prof img')];
    let pend = 0;
    const mover = () => {
      pend = 0;
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // −1..1
      imgsP.forEach((im) => { im.style.transform = `translate3d(0, ${(t * 90 * +im.dataset.z).toFixed(1)}px, 0)`; });
    };
    addEventListener('scroll', () => { if (!pend) pend = requestAnimationFrame(mover); }, { passive: true });
    mover();
  }

  function fotoNoCursor() {
    const bar = document.querySelector('.ocasiao');
    if (!bar || !ponteiroFino || bar.dataset.cursor) return;
    bar.dataset.cursor = '1';
    // presente, time, liga: fotos dos produtos e a da prensa que já está na página
    const fotos = [prodById('pet-personalizada')?.foto, prodById('colecao-posicao')?.foto, document.querySelector('.destaque .d-a')?.src || prodById('camera-narracao-emocao')?.foto];
    const fig = document.createElement('figure');
    fig.className = 'cursor-foto'; fig.setAttribute('aria-hidden', 'true');
    fig.innerHTML = '<img alt="">';
    document.body.appendChild(fig);
    const img = fig.querySelector('img');
    const pos = { x: 0, y: 0, ax: 0, ay: 0 };
    let raf = 0, ativo = false;
    const anda = () => {
      const k = reduzido ? 1 : 0.18;
      pos.x += (pos.ax - pos.x) * k; pos.y += (pos.ay - pos.y) * k;
      fig.style.translate = `${pos.x}px ${pos.y}px`;
      raf = Math.abs(pos.ax - pos.x) + Math.abs(pos.ay - pos.y) > 0.5 && ativo ? requestAnimationFrame(anda) : 0;
    };
    bar.querySelectorAll('a').forEach((a, i) => {
      img.decoding = 'async';
      a.addEventListener('pointerenter', (e) => {
        img.src = fotos[i] || fotos[0];
        if (!ativo) { pos.x = pos.ax = e.clientX + 24; pos.y = pos.ay = e.clientY - 200; }
        ativo = true;
        fig.style.rotate = `${(Math.random() * 8 - 4).toFixed(1)}deg`;
        fig.classList.add('on');
        if (!raf) raf = requestAnimationFrame(anda);
      });
    });
    bar.addEventListener('pointermove', (e) => { pos.ax = e.clientX + 24; pos.ay = e.clientY - 200; if (!raf && ativo) raf = requestAnimationFrame(anda); });
    bar.addEventListener('pointerleave', () => { ativo = false; fig.classList.remove('on'); });
    addEventListener('hashchange', () => { ativo = false; fig.classList.remove('on'); });
  }

  /* ============ eventos da interface ============ */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-m]');
    if (!el) return;
    const a = el.dataset.m, v = el.dataset.v;
    const p = sel && prodById(sel.id);
    switch (a) {
      case 'aba': mostrarAba(v); if (v === '3d') track('view_3d_tab', { item_id: sel?.id }); break;
      case 'lado': mostrarAba('3d'); virar(v); break;
      case 'compartilhar': e.preventDefault(); p && compartilhar(p); break;
      case 'tam-ajuda': e.preventDefault(); painelTamanho(); break;
      case 'usar-tam': sel.tamanho = v; refreshProduct(); document.querySelector('#tamAjuda').hidden = true; toast(`Tamanho ${v} escolhido ✓`); break;
      case 'trocar-cep': { const i = document.querySelector('[data-form="shipcalc"] input'); i?.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'center' }); i?.focus(); break; }
      case 'kit-abrir': p && kitAbrir(p); break;
      case 'kit-fechar': document.querySelector('#kit')?.classList.remove('kit-aberto'); p && desenharKit(p, false); break;
      case 'kit-mais': kit.linhas.push({ nome: '', numero: '', tam: kit.linhas.at(-1)?.tam || '' }); desenharKit(p, true); document.querySelectorAll('#kit input[data-k="nome"]').item(kit.linhas.length - 1)?.focus(); break;
      case 'kit-rm': kit.linhas.splice(+v, 1); if (!kit.linhas.length) kit.linhas.push({ nome: '', numero: '', tam: '' }); store.set('kit_' + p.id, kit); desenharKit(p, true); break;
      case 'kit-ler': {
        const lidas = lerLista(document.querySelector('#kitTexto').value);
        if (!lidas.length) { toast('Não achei nomes na lista'); break; }
        kit.linhas = kit.linhas.filter((l) => l.nome.trim() || l.tam).concat(lidas);
        store.set('kit_' + p.id, kit); desenharKit(p, true);
        toast(`${lidas.length} ${lidas.length === 1 ? 'jogador lido' : 'jogadores lidos'} ✓ Confira os tamanhos`);
        break;
      }
      case 'kit-enviar': {
        if (!p || !kitPronto()) { e.preventDefault(); break; }
        el.href = waLink(mensagemKit(p)); // garante a lista mais recente
        const n = kit.linhas.filter((l) => l.nome.trim() || l.tam).length;
        track('kit_whatsapp', ecommerce([itemGA(p, n)], n * p.preco));
        break;
      }
      case 'fechar': document.querySelector('#mModal').hidden = true; break;
      case 'sugestao': track('select_item', { item_list_name: 'completar_frete', item_id: v }); break;
    }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.k && kit && sel) {
      if (t.dataset.k === 'ano') kit.ano = t.value;
      else kit.linhas[+t.dataset.i][t.dataset.k] = t.dataset.k === 'nome' ? t.value.toUpperCase() : t.value;
      if (t.dataset.k === 'nome') { const pos = t.selectionStart; t.value = t.value.toUpperCase(); t.setSelectionRange(pos, pos); }
      store.set('kit_' + sel.id, kit);
      resumoKit(prodById(sel.id));
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.dataset.k === 'tam' && kit && sel) { kit.linhas[+e.target.dataset.i].tam = e.target.value; store.set('kit_' + sel.id, kit); resumoKit(prodById(sel.id)); }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.dataset.mForm === 'tamanho') { e.preventDefault(); responderTamanho(e.target); }
  });
  // Ao focar um campo da personalização: mostra o 3D, vira para o lado certo e flutua no celular.
  const LADO_DO_CAMPO = { nome: 'costas', numero: 'costas', nick: 'costas' };
  let personalizou = false;
  document.addEventListener('focusin', (e) => {
    const campo = e.target.dataset?.perso;
    if (!campo || campo === 'obs' || !sel || !c3d.figura) return;
    mostrarAba('3d');
    const p = prodById(sel.id);
    const lado = LADO_DO_CAMPO[campo] || (p.arte ? 'frente' : 'costas');
    c3d.carregando?.then(() => virar(lado));
    flutuar(true);
    if (!personalizou) { personalizou = true; track('customize_start', { item_id: sel.id, campo }); }
  });
  document.addEventListener('focusout', (e) => { if (e.target.dataset?.perso) setTimeout(() => { if (!document.activeElement?.dataset?.perso) flutuar(false); }, 120); });
  addEventListener('scroll', () => { const st = document.querySelector('.c3d.flutua'); if (st && !document.activeElement?.dataset?.perso) flutuar(false); }, { passive: true });

  /* ============ ganchos chamados pelo app ============ */
  let passoCk = 0;
  return {
    usa3D, chegaAte, track, restaurar,
    // fim de refreshProduct()
    produto(p) {
      if (usa3D(p)) { abas(p); montar3D(p); redesenhar(); }
      barraCompra(p);
      guardar();
    },
    // depois que uma página é desenhada
    rota(partes) {
      if (partes[0] !== 'p') { esconderBarra(); c3d.cena?.destruir(); c3d.cena = null; c3d.figura = null; }
      personalizou = false;
      if (partes[0] === undefined) { profundidade(); fotoNoCursor(); }
      if (partes[0] === 'p' && sel) {
        const p = prodById(sel.id);
        preencherCampos();
        prazoProduto();
        kit = null;
        if (kitUsa(p)) desenharKit(p, false); else document.querySelector('#kit')?.remove();
        track('view_item', ecommerce([itemGA(p)], p.preco));
      }
      if (partes[0] === 'checkout' && cart.length) {
        const itens = cart.map((i) => itemGA(prodById(i.id), i.qtd, { item_variant: `${i.modelo} ${i.tamanho}` }));
        const t = totals();
        if (ck.step === 1 && passoCk !== 1) track('begin_checkout', ecommerce(itens, t.total));
        if (ck.step === 3 && passoCk !== 3) track('add_shipping_info', { ...ecommerce(itens, t.total), shipping_tier: ck.frete?.nome });
        passoCk = ck.step;
      } else passoCk = 0;
    },
    aoAdicionar(item) {
      const p = prodById(item.id);
      track('add_to_cart', ecommerce([itemGA(p, item.qtd, { item_variant: `${item.modelo} ${item.tamanho}` })], unitPrice(item) * item.qtd));
      store.set(chaveSel(item.id), null); // pedido feito: a próxima visita começa limpa
    },
    aoConcluir(order) {
      track('purchase', { ...ecommerce(order.itens.map((i) => itemGA(prodById(i.id), i.qtd)), order.totais.total), transaction_id: order.id, payment_type: order.metodo });
    },
    aoPagar(metodo) { track('add_payment_info', { payment_type: metodo }); },
    cepCalculado(cep, end) { store.set('cepInfo', { ...end, cep: digits(cep) }); prazoProduto(); },
    completarFrete,
  };
})();
window.Melhorias = Melhorias;
