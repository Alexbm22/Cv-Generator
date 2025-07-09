export interface StripePrice {
  id: string;
  type: 'recurring' | 'one_time';
  amount: number; 
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year' | null;
  isDefault: boolean;
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  prices: StripePrice[];
  metadata?: Record<string, string>;
}