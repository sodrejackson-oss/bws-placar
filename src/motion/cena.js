import {
  WebGLRenderer, Scene, PerspectiveCamera, Fog, Color, PlaneGeometry, Mesh,
  MeshBasicMaterial, TextureLoader, SRGBColorSpace, MathUtils, Vector3,
} from 'three';
import pecas from '../data/pecas.json';
import { casos } from '../data/casos.js';

const FUNDO = '#f2f0eb';
const NUM_PLANOS = 78;
const Z_INICIO = 3.5;
const Z_FIM = -96;
const CAMERA_Z0 = 6;

// sorteio com semente fixa: o túnel é sempre o mesmo
const semente = (s) => () => {
  s |= 0; s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const smooth = (a, b, x) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Material com viés de mipmap por plano (profundidade de campo barata).
const materialComVies = (map) => {
  const m = new MeshBasicMaterial({ map, transparent: true, depthWrite: false, opacity: 0 });
  m.userData.vies = { value: 0 };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uVies = m.userData.vies;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uVies;')
      .replace('texture2D( map, vMapUv )', 'texture2D( map, vMapUv, uVies )');
  };
  m.customProgramCacheKey = () => 'vies';
  return m;
};

export function criarCena(canvas, { reduzido = false, ponteiroFino = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(FUNDO, 1);

  const scene = new Scene();
  scene.background = new Color(FUNDO);
  scene.fog = new Fog(FUNDO, 9, 44);

  const camera = new PerspectiveCamera(50, 1, 0.05, 120);
  camera.position.set(0, 0, CAMERA_Z0);

  const loader = new TextureLoader();
  const anisotropia = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const texturas = new Map();
  const textura = (url) => {
    if (!texturas.has(url)) {
      const t = loader.load(url, () => pedir());
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = anisotropia;
      texturas.set(url, t);
    }
    return texturas.get(url);
  };

  const geo = new PlaneGeometry(1, 1);
  const rnd = semente(2016);

  // —— paredes ——
  const planos = [];
  for (let i = 0; i < NUM_PLANOS; i++) {
    let ang = i * 2.39996 + (rnd() * 2 - 1) * 0.25;
    const raio = 3.5 + rnd() * 2.1;
    const z = Z_INICIO + (Z_FIM - Z_INICIO) * (i / (NUM_PLANOS - 1)) + (rnd() - 0.5) * 0.8;
    const alt = 1.05 + rnd() * 1.15;
    // os 10 primeiros fogem do canto inferior esquerdo (onde mora o wordmark)
    if (i < 10) {
      const c = Math.cos(ang), s = Math.sin(ang);
      if (c < 0.15 && s < 0.15) ang += Math.PI;
    }
    const peca = pecas[i % pecas.length];
    const mesh = new Mesh(geo, materialComVies(textura('/' + peca.arquivo)));
    mesh.scale.set(alt * peca.proporcao, alt, 1);
    mesh.position.z = z;
    mesh.rotation.x = Math.sin(ang) * 0.28;
    mesh.rotation.y = -Math.cos(ang) * 0.32;
    mesh.userData = { ang, raio };
    scene.add(mesh);
    planos.push(mesh);
  }

  // —— destaques ——
  const angDestaque = [0.55, 2.55, 3.95, 5.65];
  const destaques = casos.map((c, i) => {
    const mesh = new Mesh(geo, materialComVies(textura(`/trabalhos/${c.id}.webp`)));
    mesh.userData = { ang: angDestaque[i], raio: 4.1, z: c.z };
    mesh.position.z = c.z;
    scene.add(mesh);
    return mesh;
  });

  // estado que a timeline anima
  const estado = { camZ: CAMERA_Z0, puxar: casos.map(() => 0) };

  let retrato = false;
  let sx = 1.45, sy = 1;
  const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
  const tmp = new Vector3();

  const posicionarParedes = () => {
    for (const m of planos) {
      const { ang, raio } = m.userData;
      m.position.x = Math.cos(ang) * raio * sx;
      m.position.y = Math.sin(ang) * raio * sy;
    }
  };

  const tanMeio = () => Math.tan(MathUtils.degToRad(camera.fov / 2));
  // distância em que a foto 6×4 cobre a tela (ou cabe inteira na largura, em retrato)
  const dCobrir = () => {
    const t2 = 2 * tanMeio();
    if (retrato) return 6 / (0.9 * t2 * camera.aspect);
    return 0.94 * Math.min(4 / t2, 6 / (t2 * camera.aspect));
  };

  const redimensionar = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    retrato = camera.aspect < 0.8;
    camera.fov = retrato ? 62 : 50;
    sx = retrato ? 0.72 : 1.45;
    sy = retrato ? 1.55 : 1;
    camera.updateProjectionMatrix();
    posicionarParedes();
    pedir();
  };

  const atualizar = () => {
    const lerpZ = reduzido ? 1 : 0.14;
    camera.position.z += (estado.camZ - camera.position.z) * lerpZ;
    if (Math.abs(estado.camZ - camera.position.z) < 0.0005) camera.position.z = estado.camZ;

    const puxarMax = Math.max(...estado.puxar);
    const forca = 1 - puxarMax * 0.92;
    mouse.x += (mouse.alvoX - mouse.x) * 0.06;
    mouse.y += (mouse.alvoY - mouse.y) * 0.06;
    camera.position.x = mouse.x * 0.55 * forca;
    camera.position.y = mouse.y * 0.35 * forca;
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 12);

    const recuo = 1 - puxarMax * 0.88;
    const cam = camera.position;

    for (const m of planos) {
      const d = m.getWorldPosition(tmp).distanceTo(cam);
      m.material.opacity = smooth(0.4, 2.2, d) * recuo;
      m.visible = m.material.opacity > 0.003 && m.position.z < cam.z + 0.5;
      m.material.userData.vies.value = d < 6 ? (6 - d) * 0.45 : d > 22 ? Math.min(3, (d - 22) * 0.12) : 0;
    }

    destaques.forEach((m, i) => {
      const p = smooth(0, 1, estado.puxar[i]);
      const { ang, raio, z } = m.userData;
      m.position.set(
        MathUtils.lerp(Math.cos(ang) * raio * sx, 0, p),
        MathUtils.lerp(Math.sin(ang) * raio * sy, 0, p),
        z,
      );
      const esc = MathUtils.lerp(0.36, 1, p);
      m.scale.set(6 * esc, 4 * esc, 1);
      m.rotation.x = Math.sin(ang) * 0.28 * (1 - p);
      m.rotation.y = -Math.cos(ang) * 0.32 * (1 - p);
      const d = m.position.distanceTo(cam);
      const longe = d > 22 ? Math.min(3, (d - 22) * 0.12) : 0;
      const perto = d < 6 ? (6 - d) * 0.45 * (1 - p) : 0;
      m.material.userData.vies.value = longe + perto;
      // os outros destaques recuam junto com a parede
      const outro = puxarMax > estado.puxar[i] ? recuo : 1;
      m.material.opacity = smooth(0.4, 2.2, d) * outro;
      m.visible = m.material.opacity > 0.003 && z < cam.z + 0.5;
    });

    const parado =
      camera.position.z === estado.camZ &&
      Math.abs(mouse.alvoX - mouse.x) < 0.0005 &&
      Math.abs(mouse.alvoY - mouse.y) < 0.0005;
    return !parado;
  };

  // desenha só quando algo muda
  let pedido = 0;
  const quadro = () => {
    pedido = 0;
    const continuar = atualizar();
    renderer.render(scene, camera);
    if (continuar) pedir();
  };
  function pedir() {
    if (!pedido) pedido = requestAnimationFrame(quadro);
  }

  if (ponteiroFino && !reduzido) {
    window.addEventListener('pointermove', (e) => {
      mouse.alvoX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.alvoY = -((e.clientY / window.innerHeight) * 2 - 1);
      pedir();
    }, { passive: true });
  }

  window.addEventListener('resize', redimensionar);
  redimensionar();

  return {
    estado,
    pedir,
    dCobrir,
    get retrato() { return retrato; },
    CAMERA_Z0,
  };
}
