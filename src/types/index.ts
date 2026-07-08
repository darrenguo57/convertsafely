export interface ConversionFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface ConversionResult {
  id: string;
  originalFile: ConversionFile;
  convertedBlob: Blob;
  outputFormat: string;
  outputName: string;
  convertedAt: Date;
}

/**
 * Language code for i18n
 */
export type LangCode = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'pt' | 'ar';

/**
 * Currency code
 */
export type Currency = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'BRL' | 'SAR' | 'AED' | 'MXN' | 'ARS';

/**
 * Currency display config
 */
export const CURRENCY_CONFIG: Record<Currency, { symbol: string; code: string }> = {
  USD: { symbol: '$', code: 'USD' },
  CNY: { symbol: '¥', code: 'CNY' },
  EUR: { symbol: '€', code: 'EUR' },
  GBP: { symbol: '£', code: 'GBP' },
  BRL: { symbol: 'R$', code: 'BRL' },
  SAR: { symbol: 'ر.س', code: 'SAR' },
  AED: { symbol: 'د.إ', code: 'AED' },
  MXN: { symbol: 'MX$', code: 'MXN' },
  ARS: { symbol: 'AR$', code: 'ARS' },
};

/**
 * Language → Currency mapping
 */
export const LANG_CURRENCY_MAP: Record<LangCode, Currency> = {
  en: 'USD',
  zh: 'CNY',
  es: 'EUR',    // Spain (Latin America uses local currencies, but EUR is more universal for es locale)
  fr: 'EUR',
  de: 'EUR',
  pt: 'EUR',    // Portugal (Brazil uses BRL, handled below)
  ar: 'SAR',    // Saudi Arabia as default for Arabic
};

/**
 * Full locale → currency override (e.g. pt-BR → BRL)
 */
export const LOCALE_CURRENCY_MAP: Record<string, Currency> = {
  'pt-BR': 'BRL',
  'es-MX': 'MXN',
  'es-AR': 'ARS',
  'ar-AE': 'AED',
};

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  features: {
    maxFileSize: number;
    dailyConversions: number;
    noAds: boolean;
    batchSize: number;
  };
}

/**
 * Pricing data: monthly and yearly prices per currency, defined explicitly.
 * No runtime calculation — every displayed price comes from this table.
 */
export interface PlanPricing {
  monthly: Record<Currency, number>;
  yearly: Record<Currency, number>;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    features: { maxFileSize: 2 * 1024 * 1024, dailyConversions: 3, noAds: false, batchSize: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    features: { maxFileSize: 10 * 1024 * 1024, dailyConversions: 20, noAds: true, batchSize: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    features: { maxFileSize: 500 * 1024 * 1024, dailyConversions: -1, noAds: true, batchSize: 100 },
  },
];

/**
 * Explicit pricing table for each plan and currency.
 * All prices end in .99 (or whole numbers for yearly where appropriate).
 *
 * Monthly: Pro $5.99, Enterprise $12.99
 * Yearly:  Pro $49.99 ($4.17/mo, save 17%), Enterprise $99.99 ($8.33/mo, save 17%)
 *
 * CNY monthly: Pro ¥29.99, Enterprise ¥69.99
 * CNY yearly:  Pro ¥288.00/年 (≈¥24/月, 省17%), Enterprise ¥688.00/年
 */
export const PRICING_TABLE: Record<string, PlanPricing> = {
  pro: {
    monthly: { USD: 5.99, CNY: 29.99, EUR: 5.99, GBP: 4.99, BRL: 19.99, SAR: 22.99, AED: 21.99, MXN: 99.99, ARS: 4999.99 },
    yearly:  { USD: 49.99, CNY: 288.00, EUR: 49.99, GBP: 39.99, BRL: 159.99, SAR: 199.99, AED: 179.99, MXN: 799.99, ARS: 39999.99 },
  },
  enterprise: {
    monthly: { USD: 12.99, CNY: 69.99, EUR: 12.99, GBP: 10.99, BRL: 39.99, SAR: 49.99, AED: 44.99, MXN: 199.99, ARS: 9999.99 },
    yearly:  { USD: 99.99, CNY: 688.00, EUR: 99.99, GBP: 89.99, BRL: 339.99, SAR: 449.99, AED: 399.99, MXN: 1599.99, ARS: 79999.99 },
  },
  free: {
    monthly: { USD: 0, CNY: 0, EUR: 0, GBP: 0, BRL: 0, SAR: 0, AED: 0, MXN: 0, ARS: 0 },
    yearly:  { USD: 0, CNY: 0, EUR: 0, GBP: 0, BRL: 0, SAR: 0, AED: 0, MXN: 0, ARS: 0 },
  },
};

/**
 * Get currency for a given language code
 */
export function getCurrencyForLang(lang: string): Currency {
  // Check locale override first (e.g. pt-BR)
  if (LOCALE_CURRENCY_MAP[lang]) {
    return LOCALE_CURRENCY_MAP[lang];
  }
  // Check base language code (e.g. pt → EUR)
  const baseLang = lang.split('-')[0] as LangCode;
  return LANG_CURRENCY_MAP[baseLang] ?? 'USD';
}

/**
 * Get localized monthly price for a plan
 */
export function getMonthlyPrice(planId: string, currency: Currency): number {
  return PRICING_TABLE[planId]?.monthly[currency] ?? 0;
}

/**
 * Get localized yearly price for a plan
 */
export function getYearlyPrice(planId: string, currency: Currency): number {
  return PRICING_TABLE[planId]?.yearly[currency] ?? 0;
}

/**
 * Calculate the monthly equivalent of a yearly price
 */
export function getYearlyMonthlyEquiv(planId: string, currency: Currency): number {
  const yearlyPrice = getYearlyPrice(planId, currency);
  if (yearlyPrice === 0) return 0;
  return Math.round((yearlyPrice / 12) * 100) / 100;
}

/**
 * Calculate savings percentage for yearly vs monthly
 */
export function getYearlySavingsPercent(planId: string, currency: Currency): number {
  const monthly = getMonthlyPrice(planId, currency);
  const yearly = getYearlyPrice(planId, currency);
  if (monthly === 0 || yearly === 0) return 0;
  const totalMonthly = monthly * 12;
  return Math.round(((totalMonthly - yearly) / totalMonthly) * 100);
}
