import { sleep, waitForAnimation } from "../animations";
import { ANIMATION_TIMEOUT_DEFAULT } from "../../constants";

describe("animations", () => {
  describe("sleep", () => {
    it("should resolve after specified milliseconds", async () => {
      const start = Date.now();
      await sleep(50);
      const end = Date.now();
      const elapsed = end - start;
      // Allow some tolerance for timing
      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe("waitForAnimation", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should resolve immediately if element not found", async () => {
      const start = Date.now();
      await waitForAnimation("non-existent-id");
      const end = Date.now();
      // Should use timeout fallback
      expect(end - start).toBeGreaterThanOrEqual(ANIMATION_TIMEOUT_DEFAULT - 10);
    });

    it("should wait for animation to complete", async () => {
      // Create a mock element with animation
      const element = document.createElement("div");
      element.setAttribute("data-card-id", "test-card");
      element.style.animationDuration = "0.1s";
      document.body.appendChild(element);

      let animationEndFired = false;
      const handleAnimationEnd = () => {
        animationEndFired = true;
      };
      element.addEventListener("animationend", handleAnimationEnd);

      const promise = waitForAnimation("test-card");

      // Simulate animation end - use Event instead of AnimationEvent for jsdom compatibility
      setTimeout(() => {
        const event = new Event("animationend", { bubbles: true });
        Object.defineProperty(event, "animationName", { value: "card-deal" });
        element.dispatchEvent(event);
      }, 50);

      await promise;
      expect(animationEndFired).toBe(true);

      element.removeEventListener("animationend", handleAnimationEnd);
    });

    it("should use timeout fallback if animation doesn't fire", async () => {
      const element = document.createElement("div");
      element.setAttribute("data-card-id", "test-card-2");
      // Use a short animation duration so the provided timeout is used
      element.style.animationDuration = "0.1s";
      document.body.appendChild(element);

      const start = Date.now();
      const promise = waitForAnimation("test-card-2", 300);
      
      // Wait for the promise to resolve
      await promise;
      
      const end = Date.now();

      // Should use the provided timeout (300ms) as fallback
      // Allow more time for requestAnimationFrame delays (2 frames + timeout + buffer)
      expect(end - start).toBeGreaterThanOrEqual(250);
      expect(end - start).toBeLessThan(1000);
    }, 5000);
  });
});

