import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { translations } from '../i18n/translations';
import type { Lang, TranslationKey } from '../i18n/translations';

interface LanguageCtx {
  lang: Lang;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const isRTL = lang === 'he';
  const t = (key: TranslationKey) => translations[lang][key];
  const toggleLang = () => setLang((l) => (l === 'en' ? 'he' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, isRTL, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
