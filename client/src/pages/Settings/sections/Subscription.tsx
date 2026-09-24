import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarClock, Coins, Crown, Sparkles } from "lucide-react";
import Button from "../../../components/UI/Buttons/Button";
import ConfirmationDialog from "../../../components/UI/ConfirmationDialog";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";
import { useUserProfile } from "../../../hooks/useUser";
import { useCancelSubscription, useResumeSubscription } from "../../../hooks/useStripe";
import { routes } from "../../../router/routes";

const formatDate = (value: Date | string | null | undefined): string => {
  if (!value) return "Not available";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
};

const normalizeStatus = (status: string | undefined) => {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
};

const formatBillingInterval = (interval?: string, intervalCount?: number) => {
  if (!interval) return "Not available";
  if (!intervalCount || intervalCount === 1) {
    return `Every ${interval}`;
  }

  return `Every ${intervalCount} ${interval}s`;
};

const getPlanLabel = (interval?: string, intervalCount?: number) => {
  if (!interval) return "Subscription Plan";
  const capitalizedInterval = interval.charAt(0).toUpperCase() + interval.slice(1);
  if (!intervalCount || intervalCount === 1) {
    return `${capitalizedInterval}ly Plan`;
  }
  return `${intervalCount}-${capitalizedInterval} Plan`;
};

const Subscription: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useUserProfile();

  const { mutate: cancelSubscription, isPending: isCanceling } = useCancelSubscription();
  const { mutate: resumeSubscription, isPending: isResuming } = useResumeSubscription();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const subscription = userProfile?.subscription ?? null;
  const hasSubscriptionBenefits = subscription?.has_benefits ?? false;
  const activeSubscription = hasSubscriptionBenefits ? subscription : null;
  const credits = userProfile?.credits ?? 0;
  const hasCredits = credits > 0;

  const isMutationPending = isCanceling || isResuming;

  const handleConfirmCancelSubscription = () => {
    cancelSubscription(undefined, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
        void refetch();
      },
    });
  };

  const handleResumeSubscription = () => {
    resumeSubscription(undefined, {
      onSuccess: () => {
        void refetch();
      },
    });
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading access details...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Access &amp; Plan</h1>
        <p className="text-sm text-red-600">We could not load your billing details right now.</p>
        <Button
          onClick={() => void refetch()}
          buttonStyle={ButtonStyles.secondary}
          className="!rounded-lg !px-4 !py-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Access &amp; Plan</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your current access, subscription status, and export credits.</p>
      </div>

      <div className="border-b border-gray-200" />

      {activeSubscription ? (
        <>
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-gray-500">Current plan</h2>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Crown className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-semibold text-gray-900">
                    {getPlanLabel(activeSubscription.billing_interval, activeSubscription.billing_interval_count)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      activeSubscription.has_cancellation_requested
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {activeSubscription.has_cancellation_requested ? "Ending soon" : normalizeStatus(activeSubscription.status)}
                  </span>
                </div>
              </div>

              {activeSubscription.has_cancellation_requested ? (
                <Button
                  onClick={handleResumeSubscription}
                  buttonStyle={ButtonStyles.primary}
                  className="!rounded-lg !px-4 !py-2"
                  disabled={isMutationPending}
                >
                  Resume Subscription
                </Button>
              ) : (
                <Button
                  onClick={() => setIsCancelDialogOpen(true)}
                  buttonStyle={ButtonStyles.secondary}
                  className="!rounded-lg !px-4 !py-2 !bg-white"
                  disabled={isMutationPending}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Billing cycle</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {formatBillingInterval(activeSubscription.billing_interval, activeSubscription.billing_interval_count)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{activeSubscription.will_renew ? "Renews at" : "Access until"}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {formatDate(activeSubscription.will_renew ? activeSubscription.current_period_end : activeSubscription.benefits_expires_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Auto renew</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">{activeSubscription.will_renew ? "Enabled" : "Disabled"}</p>
              </div>
            </div>

            {activeSubscription.has_cancellation_requested && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <CalendarClock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Cancellation is scheduled. Your full access remains available until {formatDate(activeSubscription.benefits_expires_at)}.
                </span>
              </div>
            )}
          </section>

          {hasCredits && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-600">
              <Coins className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>
                You also have <span className="font-semibold text-gray-900">{credits} export credit{credits === 1 ? "" : "s"}</span> in
                reserve, only used if your subscription ever becomes inactive.
              </span>
            </div>
          )}
        </>
      ) : hasCredits ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-sm font-medium text-gray-500">Export credits</h2>
              <Coins className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-semibold text-gray-900">{credits}</div>
                <p className="mt-1 text-sm text-gray-500">credit{credits === 1 ? "" : "s"} available</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Export access active
              </span>
            </div>

            <p className="mt-5 text-sm text-gray-600 border-t border-gray-100 pt-4">
              Each credit unlocks one CV export. Credits are consumed only while you don&apos;t have an active subscription.
            </p>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 shadow-sm">
            <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-blue-100" />
            <div className="relative flex h-full flex-col justify-between gap-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Want full access to the app?</h2>
                <p className="mt-1.5 text-sm text-gray-600">
                  Upgrade your plan for unlimited exports, edits, and every template — no need to track credits.
                </p>
              </div>
              <Button
                onClick={() => navigate(routes.plans.path)}
                buttonStyle={ButtonStyles.primary}
                className="!rounded-lg !px-2 !py-3 flex items-center gap-1.5 self-start h-fit"
              >
                <span>Upgrade your plan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </div>
      ) : (
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Crown className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-semibold text-gray-900">Free Plan</h2>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    Current plan
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-gray-600 max-w-md">
                  You&apos;re currently on the free plan. Upgrade to unlock unlimited exports, edits, and every CV template.
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate(routes.plans.path)}
              buttonStyle={ButtonStyles.primary}
              className="!rounded-lg !px-5 !py-2.5 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Upgrade</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      )}

      <ConfirmationDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancelSubscription}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription?"
        warnings={[
          activeSubscription
            ? `You'll keep full access until ${formatDate(activeSubscription.benefits_expires_at)}, then it won't renew.`
            : "Your subscription will not renew at the end of the current billing period.",
          "You can resume anytime before your access ends.",
        ]}
        confirmLabel="Cancel Subscription"
        cancelLabel="Keep Subscription"
        isLoading={isCanceling}
      />
    </div>
  );
};

export default Subscription;
