/* ==========================================
   GLOBAL PHONETIC INTERCEPTOR (SPACE BASED)
========================================== */

let isApplying: boolean = false;

let currentLang: string =
  sessionStorage.getItem("aicode") || "en";

/* ==========================================
   FIELD SKIP LOGIC
========================================== */

function shouldSkipField(
  el: EventTarget | null
): boolean {

  if (
    !(
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement
    )
  ) {
    return true;
  }

  if (el.dataset?.phonetic === "off") return true;

  if (el instanceof HTMLInputElement) {

    const skipTypes: string[] = [
      "password",
      "email",
      "number",
      "tel",
      "url",
      "search",
    ];

    if (skipTypes.includes(el.type)) return true;
  }

  const name = (el.name || "").toLowerCase();
  const id = (el.id || "").toLowerCase();
  const placeholder = (el.placeholder || "").toLowerCase();

  if (
    name.includes("email") ||
    name.includes("password") ||
    name.includes("captcha") ||
    id.includes("email") ||
    id.includes("password") ||
    id.includes("captcha") ||
    placeholder.includes("email") ||
    placeholder.includes("password") ||
    placeholder.includes("captcha")
  ) {
    return true;
  }

  if (
    el.closest("form")
      ?.id
      ?.toLowerCase()
      .includes("login")
  ) {
    return true;
  }

  return false;
}

/* ==========================================
   AI4BHARAT API
========================================== */

function phoneticApiPromise(
  value: string,
  lang: string = sessionStorage.getItem("aicode") || "en"
): Promise<string> {

  return new Promise((resolve) => {

    if (!value || !value.trim()) {
      resolve(value);
      return;
    }

    if (lang !== "en") {

      fetch("/transliterate/sentence", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },

        body: JSON.stringify({
          text: value,
          target_lang: lang,
          beam_width: 4,
        }),

      })
        .then((res: Response) => res.json())

        .then((data: any) => {

          const converted: string | undefined =
            data?.result?.[lang];

          resolve(converted || value);

        })

        .catch(() => resolve(value));

    } else {

      resolve(value);

    }

  });
}

/* ==========================================
   GLOBAL KEYDOWN INTERCEPTOR
========================================== */

function interceptSpaceKey(): void {

  document.addEventListener(
    "keydown",

    async (event: KeyboardEvent) => {

      if (event.key !== " ") return;

      const el =
        event.target as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null;

      if (shouldSkipField(el)) return;

      if (!el) return;

      if (isApplying) return;

      const cursorPos: number =
        el.selectionStart ?? 0;

      const text: string = el.value;

      const textBeforeCursor =
        text.substring(0, cursorPos);

      const textAfterCursor =
        text.substring(cursorPos);

      const match =
        textBeforeCursor.match(/(\S+)$/);

      if (!match) return;

      const lastWord: string = match[0];

      event.preventDefault();

      isApplying = true;

      const translated: string =
        await phoneticApiPromise(lastWord);

      const newText: string =
        textBeforeCursor.slice(
          0,
          textBeforeCursor.length -
            lastWord.length
        ) +
        translated +
        " " +
        textAfterCursor;

      el.value = newText;

      const newCursorPos: number =
        textBeforeCursor.length -
        lastWord.length +
        translated.length +
        1;

      el.setSelectionRange(
        newCursorPos,
        newCursorPos
      );

      el.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );

      isApplying = false;

    },

    true
  );
}

/* ==========================================
   ENABLE
========================================== */

export function enablePhonetic(): void {

  if (
    window.location.pathname
      .toLowerCase()
      .includes("login")
  ) {
    return;
  }

  interceptSpaceKey();
}

/* ==========================================
   LANGUAGE SWITCH
========================================== */

export function setPhoneticLanguage(
  lang: string
): void {

  currentLang = lang;

  sessionStorage.setItem(
    "aicode",
    lang
  );
}