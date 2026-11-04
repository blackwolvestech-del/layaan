// "Atelier in the round": look photographs on a curved ring that turns with scroll, drag and a
// slow idle spin, tilting toward the cursor. Lazy-loaded; paused offscreen and in background tabs.
// The section around it provides the accessible controls (look index) and the reduced-motion /
// no-WebGL fallback.
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { BufferAttribute, Group, LinearFilter, Mesh, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector2, WebGLRenderer, type Texture } from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    vUv = uv;
    vec3 n = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = dot(n, normalize(-mv.xyz));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  uniform float uReady;
  uniform float uHover;
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    vec3 col = texture2D(uMap, vUv).rgb;
    col = mix(vec3(0.12, 0.1, 0.08), col, uReady);
    // Panels turning away fall into shadow; the hovered panel lifts slightly.
    float light = smoothstep(0.05, 0.9, vFacing);
    col *= mix(0.18, 1.0, light) * (1.0 + uHover * 0.12);
    // Thin gold edge.
    float edge = step(vUv.x, 0.006) + step(0.994, vUv.x) + step(vUv.y, 0.004) + step(0.996, vUv.y);
    col = mix(col, vec3(0.79, 0.64, 0.36), clamp(edge, 0.0, 1.0) * 0.9);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface RingItem {
  id: string;
  src: string;
  /** Used if `src` fails to load (e.g. a browser without WebP). */
  fallback?: string;
}

export interface RingHandle {
  /** Turn the ring so item `index` faces the viewer. */
  focus: (index: number) => void;
}

interface RingGalleryProps {
  items: RingItem[];
  active: boolean;
  className?: string;
  onSelect: (index: number) => void;
  onFront: (index: number) => void;
  onHover: (hovering: boolean) => void;
  ref?: Ref<RingHandle>;
}

const TAU = Math.PI * 2;

export default function RingGallery({ items, active, className, onSelect, onFront, onHover, ref }: RingGalleryProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const callbacks = useRef({ onSelect, onFront, onHover });
  callbacks.current = { onSelect, onFront, onHover };
  const target = useRef(0); // target rotation (radians)
  const step = TAU / items.length;

  useImperativeHandle(ref, () => ({
    focus: (index: number) => {
      // Nearest rotation that brings `index` to the front.
      const want = -index * step;
      const turns = Math.round((target.current - want) / TAU);
      target.current = want + turns * TAU;
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.touchAction = "pan-y";
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 100);
    const ring = new Group();
    scene.add(ring);

    // Panel geometry, bent onto the cylinder so the ring reads as one continuous curved wall.
    const radius = 4.4;
    const panelH = 2.75;
    const panelW = panelH * 0.75;
    const loader = new TextureLoader();
    const textures: Texture[] = [];
    const meshes = items.map((item, i) => {
      const geo = new PlaneGeometry(panelW, panelH, 24, 1);
      const pos = geo.attributes.position as BufferAttribute;
      const phi0 = i * step;
      for (let v = 0; v < pos.count; v++) {
        const lx = pos.getX(v);
        const a = phi0 + lx / radius;
        pos.setXYZ(v, radius * Math.sin(a), pos.getY(v), radius * Math.cos(a));
      }
      geo.computeVertexNormals();
      const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { uMap: { value: null }, uReady: { value: 0 }, uHover: { value: 0 } } });
      const apply = (tex: Texture) => {
        tex.colorSpace = SRGBColorSpace;
        tex.minFilter = LinearFilter;
        tex.generateMipmaps = false;
        textures.push(tex);
        material.uniforms.uMap!.value = tex;
        material.uniforms.uReady!.value = 1;
      };
      loader.load(item.src, apply, undefined, () => {
        if (item.fallback) loader.load(item.fallback, apply);
      });
      const mesh = new Mesh(geo, material);
      mesh.userData.index = i;
      ring.add(mesh);
      return mesh;
    });

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Pull back on narrow screens so the front panel always fits.
      camera.position.set(0, 0.15, radius + (w < 640 ? 8.2 : 6.4));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Interaction: drag to spin (with inertia), cursor tilt, hover + click via raycasting.
    const pointer = new Vector2(2, 2);
    const tilt = new Vector2(0, 0);
    const raycaster = new Raycaster();
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let velocity = 0;
    let hovered = -1;

    const toNdc = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      velocity = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      toNdc(e);
      if (e.pointerType === "mouse") tilt.set(pointer.x, pointer.y);
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      velocity = dx * 0.005;
      target.current += velocity;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.releasePointerCapture(e.pointerId);
      if (moved < 6 && hovered >= 0) callbacks.current.onSelect(hovered);
      // Settle on the nearest panel after a throw.
      target.current = Math.round((target.current + velocity * 12) / step) * step;
    };
    const onLeave = () => {
      pointer.set(2, 2);
      tilt.set(0, 0);
    };
    const el = renderer.domElement;
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);

    // Scroll adds rotation, so the ring turns as the page moves past it.
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (activeRef.current && !dragging) target.current -= dy * 0.0016;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let last = performance.now();
    let front = -1;
    let idle = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!activeRef.current || document.hidden) return;

      // Gentle idle spin when nobody is interacting.
      idle = dragging || hovered >= 0 ? 0 : idle + dt;
      if (idle > 2.5) target.current -= dt * 0.12;

      ring.rotation.y += (target.current - ring.rotation.y) * Math.min(1, dt * 5);
      ring.rotation.x += (-tilt.y * 0.08 - ring.rotation.x) * Math.min(1, dt * 4);
      ring.position.x += (tilt.x * 0.25 - ring.position.x) * Math.min(1, dt * 4);

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      const next = hit ? (hit.object.userData.index as number) : -1;
      if (next !== hovered) {
        hovered = next;
        el.style.cursor = hovered >= 0 ? "pointer" : dragging ? "grabbing" : "grab";
        callbacks.current.onHover(hovered >= 0);
      }
      meshes.forEach((m, i) => {
        const u = (m.material as ShaderMaterial).uniforms.uHover!;
        u.value += ((i === hovered ? 1 : 0) - u.value) * Math.min(1, dt * 8);
      });

      const f = ((Math.round(-ring.rotation.y / step) % items.length) + items.length) % items.length;
      if (f !== front) {
        front = f;
        callbacks.current.onFront(f);
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      meshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as ShaderMaterial).dispose();
      });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      el.remove();
    };
  }, [items, step]);

  return <div ref={hostRef} className={className} />;
}
