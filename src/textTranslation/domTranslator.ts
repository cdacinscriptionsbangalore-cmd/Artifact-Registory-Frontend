// src/domTranslator.ts

import { translateText } from "./translatorApi.ts";

interface TranslationItem {
  target: string;
}

const translationCache: Map<string, string> = new Map();

export async function translateDom(lang: string): Promise<void> {
  if (!lang || lang === "en") return;

  const walker: TreeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const nodes: Text[] = [];
  const texts: string[] = [];

  let node: Node | null;

  while ((node = walker.nextNode())) {
    const textNode = node as Text;

    if (
      !textNode.nodeValue?.trim() ||
      textNode.parentElement?.closest(
        "input, textarea, script, style, [contenteditable='true']"
      )
    ) {
      continue;
    }

    nodes.push(textNode);
    texts.push(textNode.nodeValue);
  }

  if (!texts.length) return;

  // Only send uncached texts
  const textsToTranslate: string[] = texts.filter(
    (t) => !translationCache.has(`${lang}::${t}`)
  );

  if (textsToTranslate.length) {
    const uniqueTexts: string[] = [...new Set(textsToTranslate)];

    const response: TranslationItem[] | null =
      await translateText(uniqueTexts, lang);

    response?.forEach((item, index) => {
      const original = uniqueTexts[index];

      if (original) {
        translationCache.set(`${lang}::${original}`, item.target);
      }
    });
  }

  // Apply translations from cache
  nodes.forEach((n, i) => {
    const original = texts[i];

    if (!original) return;

    const translated = translationCache.get(`${lang}::${original}`);

    if (translated) {
      n.nodeValue = translated;
    }
  });
}