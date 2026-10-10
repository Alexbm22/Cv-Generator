// Stripe lookup_key values (see server/src/services/stripe.ts / GET /protected/stripe/prices).
export const TRIAL_LOOKUP_KEY = 'monthly_trial_offer';
export const FOUR_WEEK_LOOKUP_KEY = 'monthly_offer';
export const ANNUAL_LOOKUP_KEY = 'price_recurring_1year';
export const CREDITS_LOOKUP_KEY = '5_exports_pack';

export interface PlanBadgeCopy {
  lookupKey: string;
  title: string;
  badge?: string;
}

// Static marketing copy — Stripe product descriptions are null, so this is authored here.
// All pricing/interval numbers must keep coming from the live Stripe price data, never duplicated here.
export const TRIAL_PLAN_COPY: PlanBadgeCopy = {
  lookupKey: TRIAL_LOOKUP_KEY,
  title: 'Trial — Full Access',
  badge: 'Most popular',
};

export const ANNUAL_PLAN_COPY: PlanBadgeCopy = {
  lookupKey: ANNUAL_LOOKUP_KEY,
  title: 'Annual — Full Access',
  badge: 'Best value',
};

export const CREDITS_PLAN_COPY: PlanBadgeCopy = {
  lookupKey: CREDITS_LOOKUP_KEY,
  title: 'Export Credits',
};

export interface StaticBenefit {
  title: string;
  description: string;
}

// Only features that genuinely exist in this app — do not add anything unverified.
export const STATIC_BENEFITS: StaticBenefit[] = [
  { title: 'CV builder & every template', description: 'Create polished CVs with any available template and section.' },
  { title: 'Unlimited edits', description: 'Update your CVs as often as you like while your plan is active.' },
  { title: 'Unlimited downloads', description: 'Export as many CVs as you need while your plan is active.' },
  { title: 'Works on any device', description: 'Access your CVs from your browser, anytime.' },
];
