'use client';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LOCALES, LOCALE_LABELS, Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 backdrop-blur-sm border border-white/20">
      {SUPPORTED_LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            locale === l
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
