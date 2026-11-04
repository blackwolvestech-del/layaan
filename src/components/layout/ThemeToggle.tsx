import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/context/ThemeContext";
import { Icon } from "@/components/ui/Icon";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      aria-pressed={resolved === "dark"}
      title={`Switch to ${next} theme`}
      className={clsx("relative grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2/80", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolved}
          initial={{ rotate: -60, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 60, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          <Icon name={resolved === "dark" ? "moon" : "sun"} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
