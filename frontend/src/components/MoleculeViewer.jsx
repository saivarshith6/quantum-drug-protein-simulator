import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/* ──────────────────────────────────────────────────────────
   Vivid neon atom palette (CPK-inspired, heavily saturated)
────────────────────────────────────────────────────────── */
const ATOMS = {
  C: { color: 0x00f5ff, emissive: 0x003d40, r: 0.40 },  // electric cyan
  O: { color: 0xff2d6f, emissive: 0x40000e, r: 0.42 },  // hot magenta-pink
  N: { color: 0x7c3aed, emissive: 0x1a0040, r: 0.38 },  // deep violet → bright
  H: { color: 0xffffff, emissive: 0x1a1a2e, r: 0.24 },  // pure white
  S: { color: 0xffd600, emissive: 0x3d2e00, r: 0.44 },  // vivid gold
  P: { color: 0xff6d00, emissive: 0x3d1a00, r: 0.42 },  // neon orange
  F: { color: 0x00e676, emissive: 0x003d15, r: 0.34 },  // electric green
  Cl: { color: 0x69ff47, emissive: 0x0e3d00, r: 0.38 },  // lime
};

export default function MoleculeViewer({ structure }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!structure || !mountRef.current) return;

    let animId;
    let idleTimer;
    const el = mountRef.current;
    const W = el.clientWidth || 800;
    const H = Math.round(W * 0.55);

    /* ── Scene ─────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020818");
    scene.fog = new THREE.FogExp2("#020818", 0.032);

    /* ── Camera ────────────────────────────────────── */
    const cam = new THREE.PerspectiveCamera(58, W / H, 0.1, 1000);
    cam.position.set(0, 0, 14);

    /* ── Renderer ──────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    /* ── Lights ────────────────────────────────────── */
    // Ambient — deep blue
    scene.add(new THREE.AmbientLight(0x080820, 3));

    // Key — electric cyan
    const key = new THREE.PointLight(0x00f5ff, 8, 50);
    key.position.set(10, 10, 10);
    scene.add(key);

    // Fill — hot pink  
    const fill = new THREE.PointLight(0xff2d6f, 5, 40);
    fill.position.set(-10, -5, 8);
    scene.add(fill);

    // Rim — violet
    const rim = new THREE.PointLight(0x7c3aed, 4, 35);
    rim.position.set(0, -12, -10);
    scene.add(rim);

    // Back — gold accent
    const back = new THREE.PointLight(0xffd600, 3, 30);
    back.position.set(5, 8, -12);
    scene.add(back);

    /* ── Controls ──────────────────────────────────── */
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4;
    controls.maxDistance = 22;
    controls.rotateSpeed = 0.7;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;

    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
    });
    controls.addEventListener("end", () => {
      idleTimer = setTimeout(() => { controls.autoRotate = true; }, 3000);
    });

    /* ── Center molecule ───────────────────────────── */
    const centroid = new THREE.Vector3();
    structure.atoms.forEach(a => centroid.add(new THREE.Vector3(a.x, a.y, a.z)));
    centroid.divideScalar(structure.atoms.length);

    const group = new THREE.Group();
    scene.add(group);

    /* ── Atoms ─────────────────────────────────────── */
    structure.atoms.forEach(atom => {
      const cfg = ATOMS[atom.element] ?? { color: 0xc084fc, emissive: 0x2e1065, r: 0.38 };
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.r, 32, 24),
        new THREE.MeshPhongMaterial({
          color: cfg.color,
          emissive: cfg.emissive,
          emissiveIntensity: 0.9,
          shininess: 220,
          specular: new THREE.Color(0xffffff),
        })
      );
      mesh.position.set(atom.x - centroid.x, atom.y - centroid.y, atom.z - centroid.z);
      group.add(mesh);
    });

    /* ── Bonds ─────────────────────────────────────── */
    const bondMat = new THREE.MeshPhongMaterial({
      color: 0x00f5ff,
      emissive: 0x003040,
      emissiveIntensity: 0.6,
      shininess: 120,
      transparent: true,
      opacity: 0.55,
    });

    structure.bonds.forEach(bond => {
      const s = structure.atoms[bond.start];
      const e = structure.atoms[bond.end];
      const sv = new THREE.Vector3(s.x - centroid.x, s.y - centroid.y, s.z - centroid.z);
      const ev = new THREE.Vector3(e.x - centroid.x, e.y - centroid.y, e.z - centroid.z);
      const len = sv.distanceTo(ev);
      if (len < 0.01) return;

      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, len, 14),
        bondMat
      );
      cyl.position.copy(new THREE.Vector3().addVectors(sv, ev).multiplyScalar(0.5));
      cyl.lookAt(ev);
      cyl.rotateX(Math.PI / 2);
      group.add(cyl);
    });

    /* ── Starfield ─────────────────────────────────── */
    const starGeo = new THREE.BufferGeometry();
    const N = 600;
    const pos = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const starColors = [
      [0, 0.96, 1],    // cyan
      [0.48, 0.22, 0.93], // violet
      [1, 0.18, 0.43], // pink
      [1, 0.84, 0],    // gold
      [1, 1, 1],       // white
    ];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
      const sc = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = sc[0];
      colors[i * 3 + 1] = sc[1];
      colors[i * 3 + 2] = sc[2];
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ vertexColors: true, size: 0.08, transparent: true, opacity: 0.55 })
    ));

    /* ── Loop ──────────────────────────────────────── */
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      key.intensity = 8 + Math.sin(t * 1.1) * 1.5;
      fill.intensity = 5 + Math.cos(t * 0.8) * 1.0;
      rim.intensity = 4 + Math.sin(t * 1.4) * 0.8;
      back.intensity = 3 + Math.cos(t * 0.6) * 0.6;
      controls.update();
      renderer.render(scene, cam);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(idleTimer);
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [structure]);

  return <div ref={mountRef} style={{ width: "100%", lineHeight: 0 }} />;
}
