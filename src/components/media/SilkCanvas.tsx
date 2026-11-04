// The single Three.js enhancement: a slow, low-contrast "gold silk" shader behind the brand
// introduction. It is lazy-loaded, capped in pixel ratio, paused offscreen / in background tabs,
// and never rendered for reduced-motion users (the CSS gradient beneath is the static fallback).
import { useEffect, useRef } from "react";
import { Color, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer } from "three";

const fragment = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uGold;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    uv.x *= uRes.x / uRes.y;
    float t = uTime * 0.06;
    float band = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float y = 0.5 + 0.18 * sin(uv.x * (1.4 + fi * 0.35) + t * (1.0 + fi * 0.3) + fi * 1.7)
                    + 0.05 * sin(uv.x * 5.0 - t * 2.0 + fi);
      float d = abs(vUv.y - y);
      band += smoothstep(0.09, 0.0, d) * (0.35 - fi * 0.06);
      band += smoothstep(0.004, 0.0, d) * 0.25; // fine highlight thread
    }
    gl_FragColor = vec4(uGold, clamp(band, 0.0, 1.0) * uAlpha);
  }
`;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

export default function SilkCanvas({ active, className }: { active: boolean; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // WebGL unavailable — the gradient fallback remains.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const readGold = () => new Color(getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#b08a3e");
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uGold: { value: readGold() },
        uAlpha: { value: document.documentElement.dataset.theme === "dark" ? 0.5 : 0.38 },
      },
    });
    const geometry = new PlaneGeometry(2, 2);
    scene.add(new Mesh(geometry, material));

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      material.uniforms.uRes!.value = [w, h];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Follow theme changes without re-creating the context.
    const mo = new MutationObserver(() => {
      material.uniforms.uGold!.value = readGold();
      material.uniforms.uAlpha!.value = document.documentElement.dataset.theme === "dark" ? 0.5 : 0.38;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let raf = 0;
    const start = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!activeRef.current || document.hidden) return;
      material.uniforms.uTime!.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} />;
}
