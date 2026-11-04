import "./styles/index.css";
import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/context/AuthContext";
import { AccountDataProvider } from "@/context/AccountDataContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UiProvider } from "@/context/UiContext";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {/* "user": every Motion animation honours prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <AccountDataProvider>
            <CartProvider>
              <UiProvider>
                <App />
              </UiProvider>
            </CartProvider>
          </AccountDataProvider>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  </StrictMode>,
);
