// utils/observeDom.ts

import { translateDom } from "./domTranslator";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function observeDom(lang: string): MutationObserver {

  const observer: MutationObserver = new MutationObserver(
    (mutations: MutationRecord[]) => {

      const shouldTranslate: boolean = mutations.some(
        (mutation: MutationRecord) => {

          // Only care about added nodes
          if (mutation.type !== "childList") return false;

          if (!mutation.addedNodes.length) return false;

          const target = mutation.target as HTMLElement;

          // Ignore input / textarea / contenteditable
          if (
            target.closest(
              "input, textarea, [contenteditable='true']"
            )
          ) {
            return false;
          }

          return true;
        }
      );

      if (!shouldTranslate) return;

      // Debounce to prevent rapid API spam
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        translateDom(lang);
      }, 300);
    }
  );

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false,
  });

  return observer;
}