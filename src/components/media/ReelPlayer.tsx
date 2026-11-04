import clsx from "clsx";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { catalog } from "@/data/catalog";
import { Icon } from "@/components/ui/Icon";

/**
 * Campaign reel. Decorative autoplay is muted, inline and only runs while visible; it never
 * autoplays for reduced-motion users. Optional visible controls allow play/pause and sound.
 * `continuous` reels ignore all of that and keep looping without ever pausing.
 */
export function ReelPlayer({ className, label = "LAYAAN Atelier campaign reel", showTag = true, showControls = true, continuous = false, src }: { className?: string; label?: string; showTag?: boolean; showControls?: boolean; continuous?: boolean; src?: string }) {
  const reel = catalog.reel;
  const ref = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!continuous || !video) return;
    const resume = () => void video.play().catch(() => undefined);
    resume();
    video.addEventListener("pause", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      video.removeEventListener("pause", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [continuous]);

  useEffect(() => {
    const el = wrapRef.current;
    const video = ref.current;
    if (continuous || !el || !video || reduce || userPaused) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => setPlaying(false));
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    const onVis = () => document.hidden && video.pause();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [continuous, reduce, userPaused]);

  if (!reel) return null;

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      void v.play();
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  return (
    <div ref={wrapRef} className={clsx("group relative overflow-hidden bg-ink", className)}>
      {failed ? (
        <img src={reel.poster} alt={`${label} (video unavailable)`} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <video
          ref={ref}
          className="h-full w-full object-cover"
          poster={reel.poster}
          muted={muted}
          playsInline
          loop
          autoPlay={continuous}
          preload={continuous ? "auto" : "none"}
          aria-label={label}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        >
          <source src={src ?? reel.video} type="video/mp4" />
        </video>
      )}
      {!failed && showControls && (
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button type="button" onClick={toggle} className="glass grid h-11 w-11 place-items-center rounded-full text-ink" aria-label={playing ? "Pause reel" : "Play reel"}>
            <Icon name={playing ? "pause" : "play"} size={18} />
          </button>
          <button type="button" onClick={() => setMuted((m) => !m)} className="glass grid h-11 w-11 place-items-center rounded-full text-ink" aria-label={muted ? "Unmute reel" : "Mute reel"} aria-pressed={!muted}>
            <Icon name={muted ? "mute" : "sound"} size={18} />
          </button>
        </div>
      )}
      {showTag && <span className="code-accent absolute top-3 right-3 rounded-[2px] bg-black/40 px-2 py-1 !text-white/80">REEL_01 · {Math.round(reel.durationSeconds)}s</span>}
    </div>
  );
}
