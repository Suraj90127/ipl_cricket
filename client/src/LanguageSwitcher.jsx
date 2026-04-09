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
    <div style={{ position: "fixed", top: 18, right: 10, zIndex: 1000, display: "flex", alignItems: "center", borderRadius: "10px" }}>
      <button
        onClick={toggleLang}
        style={{ padding: "6px 14px", borderRadius: "10px", color: "#000", background: "linear-gradient(to right, #14b8a6, #06b6d4)", fontWeight: "bold", fontSize: "12px", cursor: "pointer", border: "none", boxShadow: "0 0 15px rgba(20, 184, 166, 0.3)" }}
      >
        {lang === "en" ? "हिन्दी" : "English"}
      </button>
    </div>
  );
}