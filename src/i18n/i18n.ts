/**
 * Internationalization (i18n) Framework
 */

import en from './locales/en.json';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';
export type TranslationKeys = typeof en;

const translations: Record<Language, TranslationKeys> = {
  en,
  es: require('./locales/es.json'),
  // Add more languages as needed
  fr: require('./locales/fr.json'),
  de: require('./locales/de.json'),
  zh: require('./locales/zh.json'),
};

class I18nService {
  private currentLanguage: Language = 'en';

  setLanguage(language: Language): void {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('anna_language', language);
    } else {
      console.warn(`Language ${language} not supported, falling back to English`);
      this.currentLanguage = 'en';
    }
  }

  getLanguage(): Language {
    const saved = localStorage.getItem('anna_language') as Language;
    if (saved && translations[saved]) {
      return saved;
    }
    return this.currentLanguage;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() || `{${paramKey}}`;
      });
    }

    return value;
  }

  /**
   * Format number with locale
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(num);
  }

  /**
   * Format date with locale
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLanguage).format(date);
  }

  /**
   * Format relative time
   */
  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

    if (diffInSeconds < 60) {
      return rtf.format(-Math.floor(diffInSeconds), 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
  }
}

export const i18n = new I18nService();

/**
 * Translation helper hook
 */
export function useTranslation() {
  return {
    t: (key: string, params?: Record<string, string | number>) => i18n.t(key, params),
    language: i18n.getLanguage(),
    setLanguage: (lang: Language) => i18n.setLanguage(lang),
    formatNumber: (num: number) => i18n.formatNumber(num),
    formatDate: (date: Date) => i18n.formatDate(date),
    formatRelativeTime: (date: Date) => i18n.formatRelativeTime(date),
  };
}
