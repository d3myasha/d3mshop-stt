import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loadLanguagePack } from "./init";

function normalizeLanguageCode(code: string | undefined | null): string {
  if (!code) return "ru";
  const normalized = code.replace(/_/g, "-");
  return normalized.toLowerCase() === "zh-cn" ? "zh-CN" : normalized;
}

export function useLanguageSync(
  preferredLang: string | undefined | null,
  translations?: Record<string, Record<string, unknown>> | null,
) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (translations) {
      for (const [code, pack] of Object.entries(translations)) {
        const normalizedCode = normalizeLanguageCode(code);
        if (normalizedCode !== "ru") loadLanguagePack(normalizedCode, pack);
      }
    }
  }, [translations]);

  useEffect(() => {
    const lang = normalizeLanguageCode(preferredLang);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [preferredLang, i18n]);
}

export function useAdminLanguageSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const stored = normalizeLanguageCode(localStorage.getItem("admin_preferred_lang"));
    if (stored && i18n.language !== stored) {
      i18n.changeLanguage(stored);
    }
  }, [i18n]);
}

export function setAdminLanguage(lang: string) {
  localStorage.setItem("admin_preferred_lang", normalizeLanguageCode(lang));
}
