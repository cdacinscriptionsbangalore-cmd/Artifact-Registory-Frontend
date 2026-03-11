// src/CustomTranslate.tsx
import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translateDom } from "./domTranslator.ts";
import { observeDom } from "./observeDom.ts";

const CustomTranslate: React.FC = () => {
  const { lang } = useLanguage() as { lang: string };

  useEffect(() => {
    if (!lang || lang === "en") return;

    // translate existing DOM
    translateDom(lang);

    // observe future DOM changes (React re-renders)
    const observer: MutationObserver = observeDom(lang);

    return () => observer.disconnect();
  }, [lang]);

  return null;
};

export default CustomTranslate;