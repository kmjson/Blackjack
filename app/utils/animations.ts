import {
  ANIMATION_TIMEOUT_DEFAULT,
  ANIMATION_DURATION_DEFAULT_MS,
  ANIMATION_BUFFER_MS,
} from "../constants";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForAnimation = (
  cardInstanceId: string,
  timeout = ANIMATION_TIMEOUT_DEFAULT,
): Promise<void> => {
  return new Promise((resolve) => {
    // Wait for next frame to ensure element is in DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.querySelector(`[data-card-id="${cardInstanceId}"]`) as HTMLElement | null;
        if (!element) {
          // Fallback if element not found
          setTimeout(resolve, timeout);
          return;
        }

        // Calculate total animation time including delay
        const computedStyle = window.getComputedStyle(element);
        const animationDuration =
          parseFloat(computedStyle.animationDuration) * 1000 || ANIMATION_DURATION_DEFAULT_MS;
        const animationDelay = parseFloat(computedStyle.animationDelay) * 1000 || 0;
        const totalTime = animationDuration + animationDelay + ANIMATION_BUFFER_MS;

        const handleAnimationEnd = (event: AnimationEvent) => {
          if (event.animationName === "card-deal" || event.animationName === "") {
            element.removeEventListener("animationend", handleAnimationEnd);
            resolve();
          }
        };

        element.addEventListener("animationend", handleAnimationEnd);

        // Timeout fallback - use calculated time or provided timeout, whichever is longer
        const fallbackTimeout = Math.max(totalTime, timeout);
        setTimeout(() => {
          element.removeEventListener("animationend", handleAnimationEnd);
          resolve();
        }, fallbackTimeout);
      });
    });
  });
};

