import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'
import { StripeService } from '../../services/stripe'
import { useAuthStore } from '../../Store';
import { StripePrice } from '../../interfaces/stripe';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Buttons/Button';
import { ButtonStyles } from '../../constants/CV/buttonStyles';
import { useUserProfile } from '../../hooks/useUser';
import { routes } from '../../router/routes';
import PlanCard from './PlanCard';
import { Check } from 'lucide-react';
import {
  TRIAL_LOOKUP_KEY,
  FOUR_WEEK_LOOKUP_KEY,
  ANNUAL_LOOKUP_KEY,
  CREDITS_LOOKUP_KEY,
  STATIC_BENEFITS,
  TRIAL_PLAN_COPY,
  ANNUAL_PLAN_COPY,
  CREDITS_PLAN_COPY,
} from '../../constants/plans';

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(amount);

const ctaLabelFor = (lookupKey: string | null | undefined): string => {
  switch (lookupKey) {
    case TRIAL_LOOKUP_KEY:
      return 'Start trial';
    case CREDITS_LOOKUP_KEY:
      return 'Buy credits';
    case ANNUAL_LOOKUP_KEY:
      return 'Subscribe';
    default:
      return 'Continue';
  }
};

const PlansPage: React.FC = () => {

  const [selectedPlan, setSelectedPlan] = useState<StripePrice>();
  const navigate = useNavigate();

  const { data: products, error, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => StripeService.getPricing(),
    enabled: useAuthStore.getState().isAuthenticated, // just when the user is authenticated
    retry: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfile();
  const hasFullAccess = userProfile?.subscription?.has_benefits ?? false;

  const pricesByLookupKey = useMemo(() => {
    const map = new Map<string, StripePrice>();
    products?.forEach((product) => {
      product.prices.forEach((price) => {
        if (price.lookup_key) map.set(price.lookup_key, price);
      });
    });
    return map;
  }, [products]);

  const trialPrice = pricesByLookupKey.get(TRIAL_LOOKUP_KEY);
  const fourWeekPrice = pricesByLookupKey.get(FOUR_WEEK_LOOKUP_KEY);
  const annualPrice = pricesByLookupKey.get(ANNUAL_LOOKUP_KEY);
  const creditsPrice = pricesByLookupKey.get(CREDITS_LOOKUP_KEY);

  // Pre-select the featured plan once prices load, matching a single always-clickable CTA.
  useEffect(() => {
    if (!selectedPlan && !hasFullAccess && trialPrice) {
      setSelectedPlan(trialPrice);
    }
  }, [trialPrice, hasFullAccess, selectedPlan]);

  const selectedDetail = useMemo(() => {
    if (!selectedPlan) return 'Select a plan to see its billing details here.';

    if (selectedPlan.lookup_key === TRIAL_LOOKUP_KEY) {
      const transition = fourWeekPrice
        ? ` at ${formatCurrency(fourWeekPrice.amount, fourWeekPrice.currency)} / 4 weeks`
        : '';
      return `Starts today for ${formatCurrency(selectedPlan.amount, selectedPlan.currency)}, 10 days of full access. Then automatically continues as the 4-week plan${transition} unless you cancel first.`;
    }

    if (selectedPlan.lookup_key === ANNUAL_LOOKUP_KEY) {
      return `Billed once a year at ${formatCurrency(selectedPlan.amount, selectedPlan.currency)} (equivalent to ${formatCurrency(selectedPlan.amount / 12, selectedPlan.currency)}/month). Renews automatically unless you cancel.`;
    }

    if (selectedPlan.lookup_key === CREDITS_LOOKUP_KEY) {
      return 'One-time purchase, no subscription. Each credit unlocks one new CV export — re-downloading a CV you already exported is always free.';
    }

    return '';
  }, [selectedPlan, fourWeekPrice]);

  const handleContinue = () => {
    if (!selectedPlan) return;
    const mode = selectedPlan.type === 'recurring' ? 'subscription' : 'payment';
    navigate(`/checkout/${selectedPlan.lookup_key}?mode=${mode}`);
  }

  if (isLoading || isUserProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-red-500 font-medium">Something went wrong while loading the plans.</p>
      </div>
    )
  }

  // Active subscribers manage their plan from Settings, not from the marketing Plans page
  if (hasFullAccess) {
    return <Navigate to={`${routes.settings.path}?section=access`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-[#00409f]">Choose your plan</h1>
          <p className="mt-2 text-[#6e6e73]">Everything you need to build, edit, and export professional CVs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Benefits panel — the highlighted box reacts to whichever plan is selected on the right */}
          <div className="order-2 lg:order-1 lg:col-span-3 bg-white rounded-2xl border border-[#d2d2d7]/60 p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">All included benefits</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {STATIC_BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0071e3]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">{benefit.title}</p>
                    <p className="text-sm text-[#6e6e73]">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[#f5f5f7] border border-[#d2d2d7]/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6e6e73]">Billing details</p>
              <p className="mt-1 text-sm text-[#1d1d1f]">{selectedDetail}</p>
            </div>
          </div>

          {/* Plan selector */}
          <div className="order-1 lg:order-2 lg:col-span-2 lg:sticky lg:top-8 flex flex-col gap-4">
            <div className="flex flex-col">
              {trialPrice && (
                <PlanCard
                  title={TRIAL_PLAN_COPY.title}
                  badge={TRIAL_PLAN_COPY.badge}
                  priceLabel={formatCurrency(trialPrice.amount, trialPrice.currency)}
                  priceSubLabel="for 10 days"
                  selected={selectedPlan?.id === trialPrice.id}
                  disabled={hasFullAccess}
                  onSelect={() => setSelectedPlan(trialPrice)}
                />
              )}

              {annualPrice && (
                <PlanCard
                  title={ANNUAL_PLAN_COPY.title}
                  badge={ANNUAL_PLAN_COPY.badge}
                  priceLabel={`${formatCurrency(annualPrice.amount / 12, annualPrice.currency)}/mo`}
                  priceSubLabel={`${formatCurrency(annualPrice.amount, annualPrice.currency)} billed annually`}
                  selected={selectedPlan?.id === annualPrice.id}
                  disabled={hasFullAccess}
                  onSelect={() => setSelectedPlan(annualPrice)}
                />
              )}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedPlan}
              buttonStyle={ButtonStyles.primary}
              className="!text-base !py-2.5 !px-6 w-full !max-w-none flex items-center justify-center"
            >
              {ctaLabelFor(selectedPlan?.lookup_key)}
            </Button>

            <p className="text-center text-xs text-[#6e6e73]">Secure payment via Stripe. Cancel anytime.</p>

            {creditsPrice && (
              <PlanCard
                title={CREDITS_PLAN_COPY.title}
                badge="Special offer"
                variant="offer"
                priceLabel={formatCurrency(creditsPrice.amount, creditsPrice.currency)}
                priceSubLabel={`one-time · ${creditsPrice?.metadata?.credits ?? "5"} credits`}
                selected={selectedPlan?.id === creditsPrice.id}
                onSelect={() => setSelectedPlan(creditsPrice)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlansPage;
