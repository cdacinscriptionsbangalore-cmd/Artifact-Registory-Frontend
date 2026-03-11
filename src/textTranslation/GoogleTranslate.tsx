import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

// Extend the Window interface to include Google Translate types
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const GoogleTranslate: React.FC = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,bn,as,gu,kn,ml,mr,od,pa,ta,te",
          layout:
            window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    document.cookie = `googtrans=/auto/${lang};path=/;domain=${window.location.hostname}`;
  }, []);

  return <div id="google_translate_element"></div>;
};

export default GoogleTranslate;