// Accessible drawers and modals: Radix Dialog supplies focus trapping, Escape handling,
// aria wiring and focus restoration; Motion supplies the enter/exit choreography.
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog } from "radix-ui";
import { useEffect, type ReactNode } from "react";
import { spring } from "@/utils/motion";
import { lockScroll } from "@/utils/scroll";
import { Icon } from "./Icon";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "right" | "left" | "top";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  hideTitle?: boolean;
}

function useLock(open: boolean) {
  useEffect(() => (open ? lockScroll() : undefined), [open]);
}

export function Drawer({ open, onOpenChange, title, description, side = "right", children, footer, className, hideTitle }: DrawerProps) {
  const reduce = useReducedMotion();
  useLock(open);
  const offset = side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : { y: "-100%" };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[60] bg-[var(--overlay)] backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount {...(description ? {} : { "aria-describedby": undefined })}>
              <motion.div
                data-lenis-prevent
                className={clsx(
                  "glass-strong fixed z-[70] flex flex-col text-ink outline-none",
                  side === "top" ? "inset-x-0 top-0 max-h-[92dvh]" : "inset-y-0 w-full max-w-[28rem]",
                  side === "right" && "right-0",
                  side === "left" && "left-0",
                  className,
                )}
                initial={reduce ? { opacity: 0 } : { ...offset, opacity: 1 }}
                animate={reduce ? { opacity: 1 } : { x: 0, y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { ...offset, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
                transition={spring.drawer}
              >
                <div className={clsx("flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6", hideTitle && "sr-only")}>
                  <div>
                    <Dialog.Title className="font-display text-xl">{title}</Dialog.Title>
                    {description && <Dialog.Description className="mt-0.5 text-xs text-muted">{description}</Dialog.Description>}
                  </div>
                  <Dialog.Close className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2" aria-label="Close">
                    <Icon name="close" />
                  </Dialog.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
                {footer && <div className="border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export function Modal({ open, onOpenChange, title, description, children, className }: Omit<DrawerProps, "side" | "footer">) {
  const reduce = useReducedMotion();
  useLock(open);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[60] bg-[var(--overlay)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <Dialog.Content asChild forceMount {...(description ? {} : { "aria-describedby": undefined })}>
                <motion.div
                  data-lenis-prevent
                  className={clsx("relative flex max-h-full w-full max-w-lg flex-col overflow-y-auto rounded-sm border border-line bg-surface p-6 text-ink shadow-2xl outline-none pointer-events-auto", className)}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.16 } }}
                  transition={spring.soft}
                >
                  <div className="mb-4 flex items-start justify-between gap-4 shrink-0">
                    <div>
                      <Dialog.Title className="font-display text-2xl">{title}</Dialog.Title>
                      {description && <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>}
                    </div>
                    <Dialog.Close className="-mt-1 -mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-surface-2" aria-label="Close">
                      <Icon name="close" />
                    </Dialog.Close>
                  </div>
                  <div className="min-h-0 shrink-0">{children}</div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
