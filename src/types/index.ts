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

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  pricesByCurrency?: Record<string, number>;
  features: {
    maxFileSize: number;
    dailyConversions: number;
    noAds: boolean;
    batchSize: number;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    pricesByCurrency: { USD: 0, CNY: 0 },
    features: { maxFileSize: 2 * 1024 * 1024, dailyConversions: 3, noAds: false, batchSize: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5.99,
    pricesByCurrency: { USD: 5.99, CNY: 29 },
    features: { maxFileSize: 10 * 1024 * 1024, dailyConversions: 20, noAds: true, batchSize: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 12.99,
    pricesByCurrency: { USD: 12.99, CNY: 69 },
    features: { maxFileSize: 500 * 1024 * 1024, dailyConversions: -1, noAds: true, batchSize: 100 },
  },
];

export type Currency = 'USD' | 'CNY';

export const CURRENCY_CONFIG: Record<Currency, { symbol: string; code: string }> = {
  USD: { symbol: '$', code: 'USD' },
  CNY: { symbol: '¥', code: 'CNY' },
};

/**
 * Get the currency symbol for the current language
 */
export function getCurrencyForLang(lang: string): Currency {
  return lang === 'zh' ? 'CNY' : 'USD';
}

/**
 * Get localized price for a plan
 */
export function getLocalizedPrice(monthlyPrice: number, plan: SubscriptionPlan | undefined, currency: Currency): number {
  if (!plan?.pricesByCurrency) return monthlyPrice;
  return plan.pricesByCurrency[currency] ?? monthlyPrice;
}

export const YEARLY_DISCOUNT = 0.17; // 17% discount for yearly billing

export function getYearlyPrice(monthlyPrice: number): number {
  if (monthlyPrice === 0) return 0;
  return Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100;
}
