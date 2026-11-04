import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface ThemeCtx {
  choice: ThemeChoice;
  resolved: Resolved;
  setChoice: (c: ThemeChoice) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "layaan-theme";

function systemTheme(): Resolved {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(resolved: Resolved, animate: boolean) {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduce) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 420);
  }
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(readChoice);
  const [system, setSystem] = useState<Resolved>(systemTheme);
  const resolved: Resolved = choice === "system" ? system : choice;

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystem(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Sync with other tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === KEY && setChoiceState(readChoice());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => apply(resolved, false), [resolved]);

  const setChoice = useCallback((c: ThemeChoice) => {
    try {
      if (c === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
    const next: Resolved = c === "system" ? systemTheme() : c;
    apply(next, true);
    setChoiceState(c);
  }, []);

  const toggle = useCallback(() => setChoice(resolved === "dark" ? "light" : "dark"), [resolved, setChoice]);

  const value = useMemo(() => ({ choice, resolved, setChoice, toggle }), [choice, resolved, setChoice, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
