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
    features: { maxFileSize: 2 * 1024 * 1024, dailyConversions: 3, noAds: false, batchSize: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    features: { maxFileSize: 10 * 1024 * 1024, dailyConversions: 20, noAds: true, batchSize: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9.99,
    features: { maxFileSize: 500 * 1024 * 1024, dailyConversions: -1, noAds: true, batchSize: 100 },
  },
];
