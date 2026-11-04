/** Scroll offset after which the header counts as scrolled (compact logo, shadow, minimal mode allowed). */
export const NAV_TOP_OFFSET = 80;
/** Ignore scroll jitter smaller than this (px) when deciding direction. */
export const NAV_DIRECTION_THRESHOLD = 4;

/**
 * Header state for a scroll position: `minimal` (logo + icons floating bar) while scrolling down,
 * full navigation when scrolling up or near the top. Small movements keep the current state.
 */
export function nextNavState(y: number, previousY: number, minimal: boolean) {
  const scrolled = y > NAV_TOP_OFFSET;
  if (!scrolled) return { scrolled, minimal: false };
  const delta = y - previousY;
  if (delta > NAV_DIRECTION_THRESHOLD) return { scrolled, minimal: true };
  if (delta < -NAV_DIRECTION_THRESHOLD) return { scrolled, minimal: false };
  return { scrolled, minimal };
}
