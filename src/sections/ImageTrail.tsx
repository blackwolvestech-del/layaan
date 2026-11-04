import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/fx/SplitText";
import { Magnetic } from "@/components/fx/Magnetic";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { placements } from "@/data/assets";
import { imageByFile } from "@/data/products";

const POOL = [...placements.gallery, ...placements.lookbook].map(imageByFile).filter((i) => !!i);
const GAP = 110; // px of pointer travel between photos
const LIFE = 1000; // ms each photo stays before leaving
const MAX = 9;

interface Spawn {
  id: number;
  x: number;
  y: number;
  img: number;
  rot: number;
}

/**
 * Interactive "image trail": moving the mouse across the band scatters campaign photographs
 * behind it. Touch screens get the same effect playing on its own while the band is in view;
 * reduced motion gets a still, fanned trio.
 */
export function ImageTrail() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const seq = useRef(0);
  const mouseActive = useRef(false);

  const spawn = useCallback((x: number, y: number) => {
    const id = ++seq.current;
    setSpawns((s) => [...s.slice(-(MAX - 1)), { id, x, y, img: id % POOL.length, rot: ((id * 37) % 24) - 12 }]);
    window.setTimeout(() => setSpawns((s) => s.filter((p) => p.id !== id)), LIFE);
  }, []);

  // Autoplay for touch / idle: drift photos along a slow figure-eight while in view.
  useEffect(() => {
    if (reduce || !inView) return;
    let t = 0;
    const timer = window.setInterval(() => {
      const el = ref.current;
      if (!el || mouseActive.current) return;
      t += 0.55;
      const r = el.getBoundingClientRect();
      spawn(r.width * (0.5 + 0.36 * Math.sin(t)), r.height * (0.5 + 0.28 * Math.sin(t * 2)));
    }, 520);
    return () => window.clearInterval(timer);
  }, [reduce, inView, spawn]);

  if (reduce) {
    return (
      <section ref={ref} aria-labelledby="trail-title" className="relative overflow-hidden bg-[#15120e] py-24 text-center text-[#f4ede1]">
        <div className="mx-auto flex max-w-lg justify-center">
          {POOL.slice(0, 3).map((img, i) => (
            <Img key={i} image={img} sizes="160px" className="-mx-4 aspect-[3/4] w-36 shadow-2xl" style={{ transform: `rotate(${(i - 1) * 8}deg)` }} decorative />
          ))}
        </div>
        <h2 id="trail-title" className="mt-12 font-display text-[clamp(2.5rem,1.5rem+4.5vw,5.5rem)] leading-none">
          Every look, a statement
        </h2>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-labelledby="trail-title"
      className="relative isolate flex h-[80svh] min-h-[32rem] items-center justify-center overflow-hidden bg-[#15120e] text-[#f4ede1] select-none"
      data-cursor="Move"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mouseActive.current = true;
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const l = last.current;
        if (!l || Math.hypot(x - l.x, y - l.y) > GAP) {
          last.current = { x, y };
          spawn(x, y);
        }
      }}
      onPointerLeave={() => {
        mouseActive.current = false;
        last.current = null;
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,rgb(201_164_92/0.14),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {spawns.map((s) => (
            <motion.div
              key={s.id}
              className="absolute top-0 left-0 w-[clamp(7rem,5rem+8vw,13rem)] overflow-hidden rounded-[2px] shadow-[0_20px_50px_-15px_rgb(0_0_0/0.7)]"
              style={{ x: s.x, y: s.y, translateX: "-50%", translateY: "-50%" }}
              initial={{ opacity: 0, scale: 0.5, rotate: s.rot * 2, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, rotate: s.rot, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, y: s.y + 40, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Img image={POOL[s.img]} sizes="208px" className="aspect-[3/4]" decorative />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="relative z-10 flex flex-col items-center px-6 text-center mix-blend-difference">
        <p className="nav-caps !text-white/70">Move to discover</p>
        <SplitText id="trail-title" as="h2" text="Every look, a statement" stagger={0.03} className="mt-5 max-w-4xl font-display text-[clamp(2.75rem,1.4rem+6vw,7.5rem)] leading-[0.95] text-white italic" />
      </div>
      <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center">
        <Magnetic>
          <ButtonLink to="/lookbook" variant="light" data-cursor="Open">
            Open the lookbook
          </ButtonLink>
        </Magnetic>
      </div>
    </section>
  );
}
