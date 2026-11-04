import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ReelPlayer } from "@/components/media/ReelPlayer";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { imageByFile } from "@/data/products";

/** Full-width campaign band: the reel beside two stills, with gentle scroll parallax. */
export function ReelBanner() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["8%", "-8%"]);
  const down = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <section ref={ref} aria-labelledby="reel-title" className="overflow-hidden bg-[#15120e] py-20 text-[#f3eee6] sm:py-28">
      <div className="container-x grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="nav-caps !text-[#d8b772]">The campaign</p>
          <h2 id="reel-title" className="text-h1 mt-4 text-balance">
            In motion
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-white/75">Colour worn with conviction — teal, crimson, emerald and ivory, from the LAYAAN Atelier campaign reel.</p>
          <ButtonLink to="/lookbook" variant="light" className="mt-8">
            Open the lookbook
          </ButtonLink>
        </div>
        <div className="grid grid-cols-3 items-center gap-3 sm:gap-5 lg:col-span-8">
          <motion.div style={{ y: down }} className="aspect-[3/4] overflow-hidden">
            <Img image={imageByFile("DSC09980.jpg")} sizes="25vw" className="h-full w-full" />
          </motion.div>
          <div className="aspect-[9/16] overflow-hidden">
            <ReelPlayer className="h-full w-full" showTag={false} showControls={false} continuous src="/videos/LAYAAN%20REEL%201.mp4" />
          </div>
          <motion.div style={{ y: up }} className="aspect-[3/4] overflow-hidden">
            <Img image={imageByFile("DSC00089.jpg")} sizes="25vw" className="h-full w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
