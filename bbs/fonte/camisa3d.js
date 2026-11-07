/* ============================================================
   Camisa 3D da página de produto (Three.js, carregado só aqui).
   A forma vem do mesmo contorno da prévia em SVG (Tee.SHAPE):
   frente e costas são "almofadas" com a silhueta da camisa,
   coladas na borda. As estampas chegam como dois <canvas>.
   ============================================================ */
import * as THREE from 'three';

const VB_W = 300, VB_H = 320;          // viewBox da prévia em SVG
const SEG_X = 150, SEG_Y = 160;        // resolução da malha
const ESPESSURA = 0.17;                // volume máximo do "peito" (unidades 3D)
const RAIO_BORDA = 30;                 // quanto a borda arredonda (unidades do viewBox)

// Distância de cada ponto de dentro da silhueta até a borda (chamfer 3-4).
function campoDeDistancia(shape, k = 2) {
  const w = VB_W * k, h = VB_H * k;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.scale(k, k);
  x.fill(new Path2D(shape));
  const px = x.getImageData(0, 0, w, h).data;
  const INF = 1e9, d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = px[i * 4 + 3] > 127 ? INF : 0;
  const passo = (i, j, c3) => { if (d[j] + c3 < d[i]) d[i] = d[j] + c3; };
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
    const i = y * w + xx; if (!d[i]) continue;
    if (xx > 0) passo(i, i - 1, 3);
    if (y > 0) { passo(i, i - w, 3); if (xx > 0) passo(i, i - w - 1, 4); if (xx < w - 1) passo(i, i - w + 1, 4); }
  }
  for (let y = h - 1; y >= 0; y--) for (let xx = w - 1; xx >= 0; xx--) {
    const i = y * w + xx; if (!d[i]) continue;
    if (xx < w - 1) passo(i, i + 1, 3);
    if (y < h - 1) { passo(i, i + w, 3); if (xx < w - 1) passo(i, i + w + 1, 4); if (xx > 0) passo(i, i + w - 1, 4); }
  }
  return (vx, vy) => {
    const xi = Math.min(w - 1, Math.max(0, Math.round(vx * k)));
    const yi = Math.min(h - 1, Math.max(0, Math.round(vy * k)));
    const v = d[yi * w + xi];
    return v >= INF ? 0 : v / 3 / k; // em unidades do viewBox
  };
}

function geometriaDaCamisa(shape) {
  const dist = campoDeDistancia(shape);
  const esc = 3 / VB_W; // 300 unidades do viewBox = 3 unidades 3D
  const geo = new THREE.PlaneGeometry(VB_W * esc, VB_H * esc, SEG_X, SEG_Y);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i) / esc + VB_W / 2;
    const vy = VB_H / 2 - pos.getY(i) / esc;
    const d = dist(vx, vy);
    if (d <= 0) { pos.setZ(i, 0); continue; }
    const t = Math.min(1, d / RAIO_BORDA);
    let z = Math.sqrt(1 - (1 - t) * (1 - t)) * ESPESSURA;           // borda arredondada
    const dx = (vx - 150) / 105;                                     // curva do tronco
    if (Math.abs(dx) < 1 && vy > 40) z += (1 - dx * dx) * 0.07 * t;
    pos.setZ(i, z);
  }
  geo.translate(0, -0.12, 0);
  geo.computeVertexNormals();
  return geo;
}

export function criarCamisa3D(alvo, { shape, frente, costas, aoInteragir } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  alvo.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  cena.add(new THREE.HemisphereLight(0xffffff, 0x8a8178, 1.6));
  const chave = new THREE.DirectionalLight(0xffffff, 2.2);
  chave.position.set(2.5, 3, 4);
  cena.add(chave);
  const contra = new THREE.DirectionalLight(0xffe2c0, 1.1);
  contra.position.set(-3, 1, -4);
  cena.add(contra);

  const tex = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  };
  const texFrente = tex(frente), texCostas = tex(costas);
  const mat = (map) => new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, roughness: 0.88, metalness: 0 });

  const geo = geometriaDaCamisa(shape);
  const camisa = new THREE.Group();
  const meshFrente = new THREE.Mesh(geo, mat(texFrente));
  const meshCostas = new THREE.Mesh(geo, mat(texCostas));
  meshCostas.rotation.y = Math.PI; // a silhueta é simétrica: girar a frente dá as costas
  camisa.add(meshFrente, meshCostas);
  cena.add(camisa);

  // —— rotação: arrastar, botões e um leve balanço enquanto ninguém mexe ——
  const rot = { y: -0.35, alvoY: -0.35, x: 0.05, alvoX: 0.05 };
  let arrastando = false, ultimoX = 0, ultimoY = 0, mexeu = false, ocioso = true, t0 = performance.now();

  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', (e) => {
    arrastando = true; ocioso = false; ultimoX = e.clientX; ultimoY = e.clientY;
    el.setPointerCapture(e.pointerId);
    if (!mexeu) { mexeu = true; aoInteragir && aoInteragir(); }
    pedir();
  });
  el.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    rot.alvoY += (e.clientX - ultimoX) * 0.012;
    rot.alvoX = Math.max(-0.35, Math.min(0.35, rot.alvoX + (e.clientY - ultimoY) * 0.006));
    ultimoX = e.clientX; ultimoY = e.clientY;
    pedir();
  });
  const soltar = () => { arrastando = false; };
  el.addEventListener('pointerup', soltar);
  el.addEventListener('pointercancel', soltar);

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // —— desenhar só quando algo muda ——
  let pedido = 0, visivel = true;
  function quadro(agora) {
    pedido = 0;
    if (ocioso && !reduzido) rot.alvoY = -0.35 + Math.sin((agora - t0) / 1600) * 0.32;
    const k = reduzido ? 1 : 0.12;
    rot.y += (rot.alvoY - rot.y) * k;
    rot.x += (rot.alvoX - rot.x) * k;
    camisa.rotation.set(rot.x, rot.y, 0);
    renderer.render(cena, camera);
    const andando = Math.abs(rot.alvoY - rot.y) > 0.0005 || Math.abs(rot.alvoX - rot.x) > 0.0005;
    if (visivel && (andando || (ocioso && !reduzido))) pedir();
  }
  function pedir() { if (!pedido) pedido = requestAnimationFrame(quadro); }

  const medir = () => {
    const w = alvo.clientWidth, h = alvo.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // enquadra a camisa (3 × 3,2) com folga, em qualquer proporção
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distAltura = 3.55 / 2 / Math.tan(fov / 2);
    const distLargura = 3.4 / 2 / Math.tan(fov / 2) / camera.aspect;
    camera.position.z = Math.max(distAltura, distLargura);
    camera.updateProjectionMatrix();
    pedir();
  };
  const ro = new ResizeObserver(medir);
  ro.observe(alvo);
  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) pedir(); });
  io.observe(alvo);
  medir();

  // menor ângulo até a frente (0) ou as costas (π), mantendo o sentido da volta
  const ladoMaisPerto = (base) => base + Math.round((rot.alvoY - base) / (Math.PI * 2)) * Math.PI * 2;

  return {
    atualizar() { texFrente.needsUpdate = true; texCostas.needsUpdate = true; pedir(); },
    virar(lado) {
      ocioso = false;
      rot.alvoY = ladoMaisPerto(lado === 'costas' ? Math.PI : 0);
      rot.alvoX = 0.04;
      pedir();
    },
    lado() {
      const a = ((rot.alvoY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      return a > Math.PI / 2 && a < Math.PI * 1.5 ? 'costas' : 'frente';
    },
    foto() { renderer.render(cena, camera); return renderer.domElement.toDataURL('image/png'); },
    medir,
    destruir() {
      cancelAnimationFrame(pedido); ro.disconnect(); io.disconnect();
      geo.dispose(); texFrente.dispose(); texCostas.dispose(); renderer.dispose(); el.remove();
    },
  };
}
