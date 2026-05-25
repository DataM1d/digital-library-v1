import { useEffect, RefObject } from "react";

export function useSmoothScroll(
  ref: RefObject<HTMLElement>,
  trigger: any,
  duration: number = 800,
) {
  useEffect(() => {
    if (trigger && ref.current) {
      const targetPosition =
        ref.current.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      let startTime: number | null = null;

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  }, [trigger, ref, duration]);
}
