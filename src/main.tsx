import "./styles/index.css";
import { MotionConfig } from "motion/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/context/AuthContext";
import { AccountDataProvider } from "@/context/AccountDataContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UiProvider } from "@/context/UiContext";
import { brandAssets } from "@/data/assets";
import { loadCatalog } from "@/data/catalogStore";
import { App } from "./App";

/**
 * The catalogue (products, prices, per-size stock) is read from the shared Supabase database
 * before the shop renders, so no page ever shows an empty product section while it loads.
 */
function Boot() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setState("loading");
    loadCatalog().then(
      () => live && setState("ready"),
      (err) => {
        console.error("[catalogue]", err);
        if (live) setState("error");
      },
    );
    return () => {
      live = false;
    };
  }, [attempt]);

  if (state === "ready") {
    return (
      <AuthProvider>
        <AccountDataProvider>
          <CartProvider>
            <UiProvider>
              <App />
            </UiProvider>
          </CartProvider>
        </AccountDataProvider>
      </AuthProvider>
    );
  }

  return (
    <main className="grid min-h-svh place-items-center bg-bg px-6 text-center text-ink" aria-busy={state === "loading"}>
      <div className="flex flex-col items-center gap-6">
        <img src={brandAssets.logoPng} alt="LAYAAN Atelier" className={state === "loading" ? "h-14 w-auto animate-pulse sm:h-20" : "h-14 w-auto sm:h-20"} />
        {state === "loading" ? (
          <p className="nav-caps text-muted" role="status">
            Loading the atelier…
          </p>
        ) : (
          <div role="alert" className="flex max-w-sm flex-col items-center gap-4">
            <p className="text-sm text-ink-2">We couldn't load the collection right now. Please check your connection and try again.</p>
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="nav-caps min-h-11 rounded-[2px] border border-ink px-6 hover:bg-ink hover:text-bg">
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {/* "user": every Motion animation honours prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">
        <Boot />
      </MotionConfig>
    </ThemeProvider>
  </StrictMode>,
);
