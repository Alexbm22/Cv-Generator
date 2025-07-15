export interface StripePrice {
  id: string;
  type: 'recurring' | 'one_time';
  amount: number; 
  currency: string;
  interval?: Payment_Interval;
  interval_count?: number;
}

export enum Payment_Interval {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  prices: StripePrice[];
  metadata?: Record<string, string>;
}