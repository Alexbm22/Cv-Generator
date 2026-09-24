import React, { useState } from "react";
import { Check, Copy, CreditCard, History } from "lucide-react";
import Button from "../../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";
import { PaymentAttributes, PaymentStatus } from "../../../interfaces/payments";
import { useUserProfile } from "../../../hooks/useUser";

const statusStyles: Record<PaymentStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  failed: "bg-red-100 text-red-700",
  canceled: "bg-gray-100 text-gray-700",
  succeeded: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  requires_action: "bg-amber-100 text-amber-700",
  requires_capture: "bg-amber-100 text-amber-700",
  requires_confirmation: "bg-amber-100 text-amber-700",
  requires_payment_method: "bg-amber-100 text-amber-700",
};

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

const statusLabel = (status: PaymentStatus) => String(status).replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());

const paymentTypeLabel = (payment: PaymentAttributes) => {
  if (payment.source === 'invoice' || payment.price?.type === 'recurring') {
    return "Subscription";
  }

  return "Credit purchase";
};

const formatCurrency = (amount: number, currency: string) => {
  const normalizedCurrency = currency ? currency.toUpperCase() : "USD";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: normalizedCurrency,
  }).format(amount / 100);
};

const getPaymentDisplayDate = (payment: PaymentAttributes) => {
  return payment.paid_at ?? payment.failed_at ?? payment.canceled_at ?? payment.createdAt;
};

const Billing: React.FC = () => {
  const [copiedReferenceId, setCopiedReferenceId] = useState<string | null>(null);

  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useUserProfile();

  const payments = userProfile?.payments ?? [];

  const handleCopyReference = async (referenceId: string) => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopiedReferenceId(referenceId);

      window.setTimeout(() => {
        setCopiedReferenceId((currentId) => (currentId === referenceId ? null : currentId));
      }, 1200);
    } catch {
      setCopiedReferenceId(null);
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading payment history...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Payment History</h1>
        <p className="text-sm text-red-600">We could not load your payment history.</p>
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
        <h1 className="text-2xl font-semibold text-gray-900">Payment History</h1>
        <p className="mt-1 text-sm text-gray-500">Review your payments.</p>
      </div>

      <div className="border-b border-gray-200" />

      <section className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 sm:py-2 shadow-sm">
        {payments.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white text-gray-400 shadow-sm">
              <History className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-800">No payments yet</p>
            <p className="mt-1 text-sm text-gray-500">Your transactions will appear here.</p>
          </div>
        ) : (
          <div>
            {payments.map((payment) => (
              <article key={payment.payment_id ?? `${payment.source}-${payment.createdAt}`} className="py-4 sm:py-5 border-b border-gray-200 last:border-b-0">
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-900">{paymentTypeLabel(payment)}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[payment.status]}`}>
                        {statusLabel(payment.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(getPaymentDisplayDate(payment))}</p>

                  <div className="mt-3 text-xs text-gray-600">
                    <p className="text-gray-500">Reference</p>
                    <div className="group mt-0.5 flex items-start gap-1.5 max-w-full">
                      <p className="font-medium text-gray-800 break-all">{payment.payment_id ?? "Not available"}</p>
                      {payment.payment_id ? (
                        <button
                          type="button"
                          onClick={() => void handleCopyReference(payment.payment_id!)}
                          aria-label="Copy payment reference"
                          title="Copy reference"
                          className="mt-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-gray-400 opacity-0 transition-opacity duration-150 hover:text-gray-600 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100 group-focus-within:opacity-100 cursor-pointer"
                        >
                          {copiedReferenceId === payment.payment_id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="inline-block h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right sm:self-center">
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                  {payment.quantity && payment.quantity > 0 && (
                    <p className="text-xs text-gray-500">Quantity: {payment.quantity}</p>
                  )}
                </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Billing;
