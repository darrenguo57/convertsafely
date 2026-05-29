import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubscriptionPlan } from '@/types';
import { SUBSCRIPTION_PLANS } from '@/types';

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  dailyUsage: number;
  lastUsageDate: string;
  isPremium: boolean;
  setPlan: (plan: SubscriptionPlan) => void;
  incrementUsage: () => void;
  resetDailyUsage: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentPlan: SUBSCRIPTION_PLANS[0],
      dailyUsage: 0,
      lastUsageDate: new Date().toDateString(),
      isPremium: false,
      setPlan: (plan) => set({ currentPlan: plan, isPremium: plan.id !== 'free' }),
      incrementUsage: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastUsageDate !== today) {
          set({ dailyUsage: 1, lastUsageDate: today });
        } else {
          set({ dailyUsage: state.dailyUsage + 1 });
        }
      },
      resetDailyUsage: () => set({ dailyUsage: 0 }),
    }),
    { name: 'subscription-storage' }
  )
);
