import { useEffect, useState } from "react";
import { setGoogleLanguage } from "./utils/autoTranslate";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored) {
      setLang(stored);
    }
  }, []);

 

  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
    setGoogleLanguage(next);
  };

  return (
    <div style={{ position: "fixed", top: 18, right: 10, zIndex: 1000, display: "flex", alignItems: "center",   borderRadius: "10px"}}>
      <button
        onClick={toggleLang}
        style={{ padding: "6px 12px", borderRadius: "6px",   color: "#f9fafb", cursor: "pointer", }}
      >
        {lang === "en" ? "Hindi" : "English"||"Hindi"}
      </button>
    </div>
  );
}