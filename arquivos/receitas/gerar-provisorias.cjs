// Gera as imagens provisórias da demo (substitutas das fotos originais).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];

// [arquivo, largura, altura, motivo, fundo, objeto, acento, rótulo]
const T = [
  ['t01', 1000, 1250, 'pacote', '#c9b79c', '#2f4a3a', '#f2f0eb', 'Torra Alta'],
  ['t02', 1200, 800, 'cartoes', '#3a3a38', '#f2f0eb', '#d9653b', 'Margem'],
  ['t03', 900, 1200, 'cartaz', '#d8d2c4', '#d9653b', '#141414', 'Maré'],
  ['t04', 900, 1200, 'livro', '#e6e0d3', '#2f4a3a', '#f2f0eb', 'Restinga'],
  ['t05', 1000, 1250, 'garrafa', '#efe6d6', '#b4772d', '#f7f1e6', 'Âmbar'],
  ['t06', 1200, 900, 'placa', '#b98b62', '#f2f0eb', '#5b3a24', 'Taipa'],
  ['t07', 1000, 1250, 'cardapio', '#2e3b33', '#f2ece0', '#d9653b', 'Sururu'],
  ['t08', 1000, 1250, 'sacola', '#cfc9bd', '#efe8da', '#141414', 'Feira'],
  ['t09', 1000, 1250, 'tela', '#b9a888', '#141414', '#f2f0eb', 'Preamar'],
  ['t10', 900, 1200, 'garrafa', '#5e4632', '#e9dcc0', '#7a2d1c', 'Vau'],
  ['t11', 1200, 1200, 'selo', '#f0ebe1', '#d9653b', '#f0ebe1', 'Sól'],
  ['t12', 1200, 800, 'especime', '#f2f0eb', '#141414', '#d9653b', 'Aa'],
  ['t13', 1200, 900, 'fachada', '#e9e2d4', '#2f4a3a', '#f2f0eb', 'Casa Cajá'],
  ['t14', 1200, 800, 'ceramica', '#d9cfbf', '#a8644a', '#efe7da', ''],
  ['t15', 1200, 800, 'revista', '#cfc9bd', '#f7f5f0', '#141414', 'Quadrante'],
  ['t16', 1200, 900, 'papelaria', '#7d8467', '#f2f0eb', '#d9653b', 'Margem'],
  ['t17', 900, 1200, 'cartaz', '#2f4a3a', '#e9c48b', '#f2f0eb', 'Maré Mansa'],
  ['t18', 1000, 1250, 'tela', '#e8c9b2', '#f7f5f0', '#d9653b', 'Prato Raso'],
  ['t19', 1200, 1200, 'azulejo', '#f2f0eb', '#2f4a3a', '#d9653b', ''],
  ['t20', 1000, 1250, 'pote', '#e2d5bd', '#d8a03c', '#3a3a38', 'Jandaíra'],
  ['t21', 900, 1200, 'sinal', '#c7c1b4', '#d9653b', '#f2f0eb', 'Aurora'],
  ['t22', 1200, 1200, 'selo', '#2f4a3a', '#f2f0eb', '#2f4a3a', 'Taipa'],
  ['t23', 900, 1200, 'livro', '#d9653b', '#141414', '#f2f0eb', 'Quadrante'],
  ['t24', 1000, 1250, 'vaso', '#e6dccb', '#9d5c43', '#efe7da', ''],
  ['t25', 1000, 1250, 'caixa', '#f0d9b5', '#d9653b', '#2f4a3a', 'Cajá'],
  ['t26', 1200, 800, 'ingressos', '#3a3a38', '#f2ece0', '#d9653b', 'Ladeira'],
  ['t27', 1200, 900, 'caderno', '#e3ddd0', '#f7f5f0', '#3a3a38', ''],
  ['t28', 900, 1200, 'cartaz', '#141414', '#d9653b', '#f2f0eb', 'Cine Ladeira'],
];

const D = [
  ['torra-alta', 1800, 1200, 'destaque-torra', '#cdbb9f', '#2f4a3a', '#f2f0eb', 'Torra Alta'],
  ['sol', 1800, 1200, 'destaque-sol', '#dcd2c2', '#b06d4f', '#efe6d8', 'Sól'],
  ['restinga', 1800, 1200, 'destaque-restinga', '#e4dfd4', '#2f4a3a', '#e9e2d0', 'Restinga'],
  ['preamar', 1800, 1200, 'destaque-preamar', '#9fb0ad', '#141414', '#f2f0eb', 'Preamar'],
  ['metodo-rascunho', 900, 1200, 'rascunho', '#ece8de', '#5d5b56', '', ''],
  ['metodo-sistema', 900, 1200, 'sistema', '#f7f5f0', '#2f4a3a', '#d9653b', 'Torra Alta'],
  ['metodo-rua', 900, 1200, 'rua', '#b9a888', '#2f4a3a', '#f2f0eb', 'Torra Alta'],
];

const desenho = () => {
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  window.render = ([nome, W, H, motivo, bg, obj, ac, rot]) => {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const m = Math.min(W, H);
    const F = (p, w = 500) => `${w} ${p}px Inter, sans-serif`;

    // fundo com luz lateral
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const lg = x.createLinearGradient(0, 0, W, H);
    lg.addColorStop(0, 'rgba(255,255,255,0.22)'); lg.addColorStop(1, 'rgba(0,0,0,0.16)');
    x.fillStyle = lg; x.fillRect(0, 0, W, H);
    // linha de mesa
    const mesa = H * 0.72;
    x.fillStyle = 'rgba(0,0,0,0.06)'; x.fillRect(0, mesa, W, H - mesa);

    const sombra = (cx, cy, rw, rh, a = 0.25) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rw);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.save(); x.translate(cx, cy); x.scale(1, rh / rw); x.translate(-cx, -cy);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rw, 0, 7); x.fill(); x.restore();
    };
    const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect(X, Y, w, h, r); };
    const texto = (t, X, Y, p, cor, al = 'center', w = 500, tr = -0.04) => {
      x.fillStyle = cor; x.font = F(p, w); x.textAlign = al; x.textBaseline = 'middle';
      x.letterSpacing = `${tr * p}px`; x.fillText(t, X, Y); x.letterSpacing = '0px';
    };
    const brilho = (X, Y, w, h) => {
      const g = x.createLinearGradient(X, 0, X + w, 0);
      g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.25, 'rgba(255,255,255,0.18)');
      g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
      x.fillStyle = g; x.fillRect(X, Y, w, h);
    };
    // marca da Torra Alta: três meias-luas, a de cima menor
    const marca = (cx, by, s, cor, fundo) => {
      const d = [[0, 1], [-0.62, 0.78], [-1.14, 0.5]];
      d.forEach(([o, r]) => {
        x.beginPath(); x.arc(cx, by + o * s, r * s, Math.PI, 0); x.closePath();
        x.fillStyle = cor; x.fill(); x.lineWidth = s * 0.09; x.strokeStyle = fundo; x.stroke();
      });
    };
    const ramo = (X, Y, s, cor, lw) => {
      x.strokeStyle = cor; x.lineWidth = lw; x.lineCap = 'round';
      x.beginPath(); x.moveTo(X, Y + s); x.bezierCurveTo(X - s * 0.1, Y + s * 0.4, X + s * 0.15, Y, X + s * 0.05, Y - s * 0.6);
      for (let i = 0; i < 4; i++) {
        const yy = Y + s * 0.7 - i * s * 0.35, sg = i % 2 ? 1 : -1;
        x.moveTo(X + 0.02 * s, yy); x.quadraticCurveTo(X + sg * s * 0.2, yy - s * 0.25, X + sg * s * 0.32, yy - s * 0.18);
      }
      x.stroke();
    };

    const P = {
      pacote() {
        const w = W * 0.42, h = H * 0.55, X = (W - w) / 2, Y = mesa - h;
        sombra(W / 2, mesa, w * 0.7, w * 0.12, 0.35);
        x.fillStyle = obj; x.beginPath(); x.moveTo(X + w * 0.05, Y); x.lineTo(X + w * 0.95, Y);
        x.lineTo(X + w, mesa); x.lineTo(X, mesa); x.closePath(); x.fill();
        x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(X + w * 0.05, Y, w * 0.9, h * 0.06);
        brilho(X, Y, w, h - 1);
        marca(W / 2, Y + h * 0.48, w * 0.2, ac, obj);
        texto(rot, W / 2, Y + h * 0.66, w * 0.1, ac);
        texto('café de altitude · 250 g', W / 2, Y + h * 0.76, w * 0.045, ac, 'center', 400, 0);
      },
      cartoes() {
        for (let i = 0; i < 5; i++) {
          const w = m * 0.55, h = w * 0.58, X = W * 0.25 + i * 8, Y = H * 0.32 - i * 6;
          x.save(); x.translate(X + w / 2, Y + h / 2); x.rotate(-0.12 + i * 0.03);
          x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 30; x.shadowOffsetY = 12;
          x.fillStyle = i === 4 ? ac : obj; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
          if (i === 4) texto(rot.toLowerCase(), 0, 0, w * 0.14, obj, 'center', 400);
          x.restore();
        }
      },
      cartaz() {
        const w = W * 0.62, h = w * 1.4, X = (W - w) / 2, Y = H * 0.1;
        x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 40; x.shadowOffsetY = 18;
        x.fillStyle = obj; x.fillRect(X, Y, w, h); x.shadowColor = 'transparent';
        x.fillStyle = ac;
        x.beginPath(); x.arc(X + w * 0.5, Y + h * 0.42, w * 0.3, 0, 7); x.fill();
        x.fillStyle = obj; x.fillRect(X, Y + h * 0.42, w, h * 0.04);
        texto(rot, X + w * 0.07, Y + h * 0.82, w * 0.12, ac, 'left');
        texto('programa · entrada franca', X + w * 0.07, Y + h * 0.91, w * 0.04, ac, 'left', 400, 0);
      },
      livro() {
        const w = W * 0.55, h = w * 1.42, X = (W - w) / 2 + W * 0.03, Y = H * 0.11;
        x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(X - w * 0.06, Y + h * 0.02, w * 0.06, h);
        x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 40; x.shadowOffsetY = 20;
        x.fillStyle = obj; x.fillRect(X, Y, w, h); x.shadowColor = 'transparent';
        brilho(X, Y, w, h);
        ramo(X + w * 0.5, Y + h * 0.36, w * 0.3, ac, w * 0.012);
        texto(rot, X + w * 0.5, Y + h * 0.82, w * 0.11, ac);
      },
      garrafa() {
        const w = W * 0.3, h = H * 0.56, X = (W - w) / 2, Y = mesa - h;
        sombra(W / 2, mesa, w * 0.8, w * 0.12, 0.4);
        x.fillStyle = obj; rr(X + w * 0.36, Y - h * 0.18, w * 0.28, h * 0.3, 8); x.fill();
        rr(X, Y + h * 0.08, w, h * 0.92, [w * 0.35, w * 0.35, 12, 12]); x.fill();
        brilho(X, Y - h * 0.18, w, h * 1.18);
        x.fillStyle = ac; x.fillRect(X + w * 0.08, Y + h * 0.42, w * 0.84, h * 0.36);
        texto(rot, W / 2, Y + h * 0.56, w * 0.17, obj);
        texto('nº 07', W / 2, Y + h * 0.68, w * 0.07, obj, 'center', 400, 0);
      },
      placa() {
        x.fillStyle = 'rgba(80,50,30,0.15)';
        for (let i = 0; i < 400; i++) x.fillRect(rnd() * W, rnd() * H, 3 + rnd() * 30, 2 + rnd() * 4);
        const w = W * 0.5, h = w * 0.45, X = (W - w) / 2, Y = H * 0.3;
        x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 24; x.shadowOffsetY = 10;
        x.fillStyle = obj; x.fillRect(X, Y, w, h); x.shadowColor = 'transparent';
        texto(rot, W / 2, Y + h * 0.48, h * 0.32, ac);
      },
      cardapio() {
        const w = W * 0.5, h = w * 1.45, X = W * 0.22, Y = H * 0.14;
        x.save(); x.translate(X + w / 2, Y + h / 2); x.rotate(0.06);
        x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = 40; x.shadowOffsetY = 16;
        x.fillStyle = obj; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
        texto(rot, 0, -h * 0.36, w * 0.13, ac);
        x.fillStyle = 'rgba(20,20,20,0.55)';
        for (let i = 0; i < 9; i++) { x.fillRect(-w * 0.36, -h * 0.18 + i * h * 0.065, w * (0.4 + rnd() * 0.3), h * 0.012); }
        x.restore();
        x.fillStyle = '#e9e1d2'; x.beginPath(); x.arc(W * 0.82, H * 0.78, W * 0.14, 0, 7); x.fill();
      },
      sacola() {
        const w = W * 0.5, h = w * 1.1, X = (W - w) / 2, Y = H * 0.24;
        x.strokeStyle = obj; x.lineWidth = w * 0.035;
        x.beginPath(); x.arc(W / 2, Y, w * 0.24, Math.PI, 0); x.stroke();
        x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 30; x.shadowOffsetY = 14;
        x.fillStyle = obj; x.fillRect(X, Y, w, h); x.shadowColor = 'transparent';
        texto(rot, W / 2, Y + h * 0.5, w * 0.16, ac);
        x.fillStyle = '#d9653b'; x.beginPath(); x.arc(W / 2, Y + h * 0.3, w * 0.06, 0, 7); x.fill();
      },
      tela() {
        const w = W * 0.4, h = w * 2.05, X = (W - w) / 2, Y = (H - h) / 2;
        x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 50; x.shadowOffsetY = 24;
        x.fillStyle = '#141414'; rr(X, Y, w, h, w * 0.14); x.fill(); x.shadowColor = 'transparent';
        const p = w * 0.04;
        x.fillStyle = obj === '#141414' ? '#f2f0eb' : obj; rr(X + p, Y + p, w - 2 * p, h - 2 * p, w * 0.11); x.fill();
        const tc = obj === '#141414' ? '#141414' : '#141414';
        texto(rot, X + w * 0.12, Y + h * 0.14, w * 0.09, tc, 'left');
        x.strokeStyle = ac === '#f2f0eb' ? '#2f4a3a' : ac; x.lineWidth = w * 0.02; x.beginPath();
        for (let i = 0; i <= 40; i++) { const t = i / 40; const yy = Y + h * 0.42 + Math.sin(t * Math.PI * 2.2) * h * 0.08; i ? x.lineTo(X + w * 0.1 + t * w * 0.8, yy) : x.moveTo(X + w * 0.1, yy); }
        x.stroke();
        x.fillStyle = 'rgba(20,20,20,0.2)';
        for (let i = 0; i < 4; i++) x.fillRect(X + w * 0.12, Y + h * 0.62 + i * h * 0.07, w * 0.76, h * 0.045);
      },
      selo() {
        const r = m * 0.3;
        x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 30; x.shadowOffsetY = 12;
        x.fillStyle = obj; x.beginPath(); x.arc(W / 2, H / 2, r, 0, 7); x.fill(); x.shadowColor = 'transparent';
        x.strokeStyle = ac; x.lineWidth = r * 0.03; x.beginPath(); x.arc(W / 2, H / 2, r * 0.82, 0, 7); x.stroke();
        texto(rot, W / 2, H / 2, r * 0.42, ac);
      },
      especime() {
        texto(rot, W * 0.08, H * 0.42, H * 0.5, obj, 'left', 500, -0.05);
        x.fillStyle = ac; x.fillRect(W * 0.62, H * 0.18, W * 0.004, H * 0.5);
        ['Margem Grotesca', 'regular · médio', 'abcdefghijklmn', '0123456789'].forEach((t, i) =>
          texto(t, W * 0.66, H * 0.22 + i * H * 0.1, H * 0.045, obj, 'left', 400, 0));
      },
      fachada() {
        x.fillStyle = '#d8cfbd'; x.fillRect(0, H * 0.2, W, H * 0.8);
        x.fillStyle = obj; x.fillRect(W * 0.15, H * 0.12, W * 0.7, H * 0.16);
        texto(rot, W / 2, H * 0.2, H * 0.08, ac);
        x.fillStyle = '#3a3a38';
        x.fillRect(W * 0.2, H * 0.38, W * 0.22, H * 0.62); x.fillRect(W * 0.55, H * 0.38, W * 0.25, H * 0.36);
        x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(W * 0.55, H * 0.38, W * 0.12, H * 0.36);
      },
      ceramica() {
        [[0.28, 0.2, obj], [0.5, 0.17, '#cfb79c'], [0.72, 0.2, obj]].forEach(([cx, r, c], i) => {
          const w = W * r, h = w * 0.85, X = W * cx - w / 2, Y = mesa - h;
          sombra(W * cx, mesa, w * 0.7, w * 0.12, 0.35);
          x.fillStyle = c; rr(X, Y, w, h, [6, 6, w * 0.3, w * 0.3]); x.fill();
          brilho(X, Y, w, h);
          x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(W * cx, Y + 2, w / 2, w * 0.07, 0, 0, 7); x.fill();
        });
      },
      revista() {
        const w = W * 0.78, h = w * 0.62, X = (W - w) / 2, Y = (H - h) / 2;
        x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 40; x.shadowOffsetY = 18;
        x.fillStyle = obj; x.fillRect(X, Y, w, h); x.shadowColor = 'transparent';
        x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(X + w / 2 - 2, Y, 4, h);
        x.fillStyle = '#b9a888'; x.fillRect(X + w * 0.54, Y + h * 0.08, w * 0.4, h * 0.84);
        texto(rot, X + w * 0.05, Y + h * 0.18, w * 0.05, ac, 'left');
        x.fillStyle = 'rgba(20,20,20,0.45)';
        for (let i = 0; i < 12; i++) x.fillRect(X + w * 0.05, Y + h * 0.34 + i * h * 0.045, w * 0.38, h * 0.014);
      },
      papelaria() {
        x.save(); x.translate(W * 0.42, H * 0.5); x.rotate(-0.05);
        x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 30; x.shadowOffsetY = 12;
        x.fillStyle = obj; x.fillRect(-W * 0.2, -H * 0.36, W * 0.4, H * 0.72);
        x.fillRect(W * 0.12, H * 0.02, W * 0.3, H * 0.2); x.shadowColor = 'transparent';
        texto(rot.toLowerCase(), -W * 0.15, -H * 0.28, W * 0.035, '#141414', 'left', 400);
        x.fillStyle = ac; x.fillRect(W * 0.14, H * 0.05, W * 0.03, W * 0.03);
        x.restore();
      },
      azulejo() {
        const n = 4, s = W / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const X = i * s, Y = j * s;
          x.fillStyle = (i + j) % 2 ? bg : '#ebe5d8'; x.fillRect(X + 3, Y + 3, s - 6, s - 6);
          x.fillStyle = obj; x.beginPath(); x.arc(X + s / 2, Y + s / 2, s * 0.32, Math.PI * ((i + j) % 4) / 2, Math.PI * ((i + j) % 4) / 2 + Math.PI); x.fill();
          x.fillStyle = ac; x.beginPath(); x.arc(X + s / 2, Y + s / 2, s * 0.07, 0, 7); x.fill();
        }
      },
      pote() {
        const w = W * 0.42, h = w * 1.05, X = (W - w) / 2, Y = mesa - h;
        sombra(W / 2, mesa, w * 0.7, w * 0.12, 0.35);
        x.fillStyle = '#3a3a38'; rr(X + w * 0.06, Y - h * 0.12, w * 0.88, h * 0.16, 8); x.fill();
        x.fillStyle = obj; rr(X, Y, w, h, w * 0.12); x.fill(); brilho(X, Y, w, h);
        x.fillStyle = '#f2ece0'; x.fillRect(X + w * 0.1, Y + h * 0.3, w * 0.8, h * 0.42);
        texto(rot, W / 2, Y + h * 0.46, w * 0.12, ac);
        texto('mel de abelha nativa', W / 2, Y + h * 0.58, w * 0.05, ac, 'center', 400, 0);
      },
      sinal() {
        x.fillStyle = '#5d5b56'; x.fillRect(W * 0.49, H * 0.3, W * 0.02, H * 0.7);
        x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 24; x.shadowOffsetY = 10;
        x.fillStyle = obj; x.fillRect(W * 0.2, H * 0.14, W * 0.6, H * 0.2);
        x.fillStyle = ac; x.fillRect(W * 0.2, H * 0.38, W * 0.6, H * 0.12); x.shadowColor = 'transparent';
        texto(rot + ' →', W * 0.5, H * 0.24, H * 0.06, ac);
        texto('Feira · bancas 1–40', W * 0.5, H * 0.44, H * 0.03, '#141414', 'center', 400, 0);
      },
      vaso() {
        const w = W * 0.38, h = H * 0.5, cx = W / 2, Y = mesa - h;
        sombra(cx, mesa, w * 0.7, w * 0.1, 0.35);
        x.fillStyle = obj; x.beginPath();
        x.moveTo(cx - w * 0.16, Y); x.lineTo(cx + w * 0.16, Y);
        x.bezierCurveTo(cx + w * 0.1, Y + h * 0.2, cx + w * 0.7, Y + h * 0.45, cx + w * 0.3, mesa);
        x.lineTo(cx - w * 0.3, mesa);
        x.bezierCurveTo(cx - w * 0.7, Y + h * 0.45, cx - w * 0.1, Y + h * 0.2, cx - w * 0.16, Y);
        x.fill(); brilho(cx - w / 2, Y, w, h);
        x.strokeStyle = ac; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - w * 0.42, Y + h * 0.55); x.lineTo(cx + w * 0.42, Y + h * 0.55); x.stroke();
      },
      caixa() {
        const w = W * 0.36, h = H * 0.5, X = (W - w) / 2, Y = mesa - h;
        sombra(W / 2, mesa, w * 0.8, w * 0.12, 0.35);
        x.fillStyle = '#f2ece0'; x.fillRect(X, Y, w, h);
        x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(X + w * 0.75, Y, w * 0.25, h);
        x.fillStyle = obj; x.beginPath(); x.arc(X + w * 0.4, Y + h * 0.4, w * 0.24, 0, 7); x.fill();
        x.fillStyle = ac; x.fillRect(X + w * 0.38, Y + h * 0.1, w * 0.04, h * 0.1);
        texto(rot, X + w * 0.4, Y + h * 0.78, w * 0.13, ac);
      },
      ingressos() {
        for (let i = 0; i < 3; i++) {
          x.save(); x.translate(W * (0.32 + i * 0.18), H * 0.5); x.rotate(-0.2 + i * 0.18);
          x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 24; x.shadowOffsetY = 10;
          x.fillStyle = i === 1 ? ac : obj; x.fillRect(-W * 0.15, -H * 0.18, W * 0.3, H * 0.36); x.shadowColor = 'transparent';
          texto(rot, 0, -H * 0.06, W * 0.035, '#141414');
          texto('sessão 0' + (i + 1), 0, H * 0.06, W * 0.018, '#141414', 'center', 400, 0);
          x.restore();
        }
      },
      caderno() {
        const w = W * 0.7, h = H * 0.7, X = (W - w) / 2, Y = (H - h) / 2;
        x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 30; x.shadowOffsetY = 12;
        x.fillStyle = obj; x.fillRect(X, Y, w, h); x.shadowColor = 'transparent';
        x.fillStyle = 'rgba(0,0,0,0.1)'; x.fillRect(X + w / 2 - 1, Y, 2, h);
        x.strokeStyle = 'rgba(60,60,58,0.7)'; x.lineWidth = 2;
        for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(X + w * 0.25, Y + h * 0.5, w * (0.05 + k * 0.025), Math.PI, 0); x.stroke(); }
        for (let k = 0; k < 14; k++) { x.beginPath(); x.moveTo(X + w * 0.58, Y + h * (0.2 + k * 0.045)); x.lineTo(X + w * (0.7 + rnd() * 0.2), Y + h * (0.2 + k * 0.045)); x.stroke(); }
      },
      // ——— destaques 3:2 ———
      'destaque-torra'() {
        [[0.33, 1.0, obj], [0.6, 0.86, '#3a3a38'], [0.8, 0.7, obj]].forEach(([cx, k, c]) => {
          const w = W * 0.2 * k, h = H * 0.62 * k, X = W * cx - w / 2, Y = mesa - h;
          sombra(W * cx, mesa, w * 0.75, w * 0.12, 0.4);
          x.fillStyle = c; x.beginPath(); x.moveTo(X + w * 0.05, Y); x.lineTo(X + w * 0.95, Y); x.lineTo(X + w, mesa); x.lineTo(X, mesa); x.fill();
          x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(X + w * 0.05, Y, w * 0.9, h * 0.05);
          brilho(X, Y, w, h);
          marca(W * cx, Y + h * 0.48, w * 0.2, ac, c);
          texto(rot, W * cx, Y + h * 0.66, w * 0.1, ac);
        });
        x.fillStyle = '#6b4a33';
        for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(W * (0.05 + rnd() * 0.18), mesa + H * (0.05 + rnd() * 0.2), 10, 7, rnd() * 3, 0, 7); x.fill(); }
      },
      'destaque-sol'() {
        [[0.22, 0.15, obj], [0.4, 0.13, '#cfb79c'], [0.58, 0.15, obj], [0.76, 0.12, '#8d5a44']].forEach(([cx, r, c]) => {
          const w = W * r, h = w * 0.9, X = W * cx - w / 2, Y = mesa - h;
          sombra(W * cx, mesa, w * 0.75, w * 0.12, 0.35);
          x.fillStyle = c; rr(X, Y, w, h, [6, 6, w * 0.3, w * 0.3]); x.fill(); brilho(X, Y, w, h);
          x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.ellipse(W * cx, Y + 2, w / 2, w * 0.07, 0, 0, 7); x.fill();
          x.save(); x.font = F(w * 0.2); x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,0.18)';
          x.fillText(rot, W * cx + 1, Y + h * 0.55 + 1); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillText(rot, W * cx, Y + h * 0.55); x.restore();
        });
      },
      'destaque-restinga'() {
        [[0.3, -0.06], [0.52, 0.04], [0.72, -0.02]].forEach(([cx, a], i) => {
          const w = W * 0.17, h = w * 1.42;
          x.save(); x.translate(W * cx, H * 0.48); x.rotate(a);
          x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 40; x.shadowOffsetY = 20;
          x.fillStyle = i === 1 ? '#3d5a47' : obj; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
          x.fillStyle = 'rgba(255,255,255,0.04)'; for (let k = 0; k < 120; k++) x.fillRect(-w / 2, -h / 2 + k * h / 120, w, 1);
          ramo(0, -h * 0.15, w * 0.3, ac, w * 0.012);
          texto(rot, 0, h * 0.32, w * 0.11, ac);
          x.restore();
        });
      },
      'destaque-preamar'() {
        x.fillStyle = 'rgba(255,255,255,0.12)';
        for (let k = 0; k < 6; k++) { x.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60; const yy = H * (0.2 + k * 0.12) + Math.sin(t * 9 + k) * 12; i ? x.lineTo(t * W, yy) : x.moveTo(0, yy); } x.lineTo(W, yy0(k)); x.lineTo(0, yy0(k)); x.fill(); }
        function yy0(k) { return H * (0.2 + k * 0.12) + 30; }
        const w = H * 0.38, h = w * 2.05, X = (W - w) / 2, Y = (H - h) / 2;
        x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 60; x.shadowOffsetY = 30;
        x.fillStyle = '#141414'; rr(X, Y, w, h, w * 0.14); x.fill(); x.shadowColor = 'transparent';
        const p = w * 0.04; x.fillStyle = '#f2f0eb'; rr(X + p, Y + p, w - 2 * p, h - 2 * p, w * 0.11); x.fill();
        texto('Preamar', X + w * 0.12, Y + h * 0.12, w * 0.08, '#141414', 'left');
        texto('Boa Viagem · 05:40', X + w * 0.12, Y + h * 0.17, w * 0.045, '#5d5b56', 'left', 400, 0);
        x.strokeStyle = '#2f4a3a'; x.lineWidth = w * 0.02; x.beginPath();
        for (let i = 0; i <= 50; i++) { const t = i / 50; const yy = Y + h * 0.42 + Math.sin(t * Math.PI * 2 + 0.6) * h * 0.09; i ? x.lineTo(X + w * 0.1 + t * w * 0.8, yy) : x.moveTo(X + w * 0.1, yy); }
        x.stroke();
        x.fillStyle = '#d9653b'; x.beginPath(); x.arc(X + w * 0.32, Y + h * 0.42 + Math.sin(0.22 * Math.PI * 2 + 0.6) * h * 0.09, w * 0.03, 0, 7); x.fill();
        texto('1,9 m', X + w * 0.12, Y + h * 0.66, w * 0.16, '#141414', 'left');
      },
      rascunho() {
        x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(W * 0.08, H * 0.06, W * 0.84, H * 0.88);
        x.strokeStyle = 'rgba(60,60,58,0.55)'; x.lineCap = 'round';
        const cx = W / 2, by = H * 0.58, s = W * 0.26;
        [[0, 1], [-0.62, 0.78], [-1.14, 0.5]].forEach(([o, r]) => {
          for (let k = 0; k < 3; k++) {
            x.lineWidth = 1.5 + rnd(); x.beginPath();
            x.arc(cx + (rnd() - 0.5) * 6, by + o * s + (rnd() - 0.5) * 6, r * s + (rnd() - 0.5) * 8, Math.PI + 0.05, -0.05); x.stroke();
            x.beginPath(); x.moveTo(cx - r * s - 10, by + o * s); x.lineTo(cx + r * s + 10, by + o * s + (rnd() - 0.5) * 4); x.stroke();
          }
        });
        x.lineWidth = 1;
        for (let i = 0; i < 5; i++) { const sx = W * (0.15 + i * 0.16), sy = H * 0.82; x.beginPath(); x.arc(sx, sy, 22, Math.PI, 0); x.stroke(); }
        x.fillStyle = 'rgba(60,60,58,0.6)'; x.font = 'italic 400 28px Inter'; x.fillText('serra? 3 camadas', W * 0.14, H * 0.16);
        x.save(); x.translate(W * 0.84, H * 0.86); x.rotate(-0.6);
        x.fillStyle = '#d8a03c'; x.fillRect(-180, -9, 360, 18); x.fillStyle = '#3a3a38'; x.fillRect(180, -9, 30, 18); x.restore();
      },
      sistema() {
        marca(W * 0.3, H * 0.28, W * 0.14, obj, bg);
        texto(rot, W * 0.52, H * 0.25, W * 0.07, '#141414', 'left');
        [[obj], ['#d9653b'], ['#b9a888'], ['#141414']].forEach(([c], i) => {
          x.fillStyle = c; x.fillRect(W * 0.1 + i * W * 0.205, H * 0.42, W * 0.18, W * 0.18);
          texto(c.toUpperCase(), W * 0.1 + i * W * 0.205, H * 0.42 + W * 0.21, W * 0.022, '#5d5b56', 'left', 400, 0);
        });
        texto('Aa', W * 0.1, H * 0.74, W * 0.2, '#141414', 'left');
        x.fillStyle = 'rgba(20,20,20,0.35)';
        for (let i = 0; i < 6; i++) x.fillRect(W * 0.5, H * 0.66 + i * H * 0.035, W * (0.25 + rnd() * 0.15), 6);
        x.strokeStyle = '#dcd8cf'; x.lineWidth = 2; x.strokeRect(W * 0.06, H * 0.06, W * 0.88, H * 0.88);
      },
      rua() {
        x.fillStyle = '#7a5c40'; for (let k = 0; k < 3; k++) x.fillRect(0, H * (0.3 + k * 0.3), W, H * 0.03);
        for (let k = 0; k < 3; k++) {
          const base = H * (0.3 + k * 0.3);
          for (let i = 0; i < 4; i++) {
            const w = W * 0.18, h = H * 0.22, X = W * (0.04 + i * 0.24), Y = base - h;
            const c = (i + k) % 3 === 0 ? obj : (i + k) % 3 === 1 ? '#3a3a38' : '#b06d4f';
            x.fillStyle = c; x.fillRect(X, Y, w, h); brilho(X, Y, w, h);
            if (c === obj) marca(X + w / 2, Y + h * 0.5, w * 0.18, ac, c);
          }
        }
      },
    };
    (P[motivo] || P.cartaz)();

    // grão
    const id = x.getImageData(0, 0, W, H), dd = id.data;
    for (let i = 0; i < dd.length; i += 4) { const n = (rnd() - 0.5) * 14; dd[i] += n; dd[i + 1] += n; dd[i + 2] += n; }
    x.putImageData(id, 0, 0);
    // vinheta
    const v = x.createRadialGradient(W / 2, H / 2, m * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.22)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c.toDataURL('image/webp', 0.82);
  };
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent('<html><body></body></html>');
  await p.evaluate(desenho);
  await p.evaluate(() => document.fonts.load('500 40px Inter'));
  for (const item of [...T, ...D]) {
    const url = await p.evaluate((it) => window.render(it), item);
    fs.writeFileSync(path.join(OUT, item[0] + '.webp'), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, '..', 'pecas.json'), JSON.stringify(
    T.map(([id, w, h, motivo]) => ({ id, arquivo: `trabalhos/${id}.webp`, largura: w, altura: h, proporcao: +(w / h).toFixed(4), motivo })), null, 2) + '\n');
  console.log('ok');
})();
