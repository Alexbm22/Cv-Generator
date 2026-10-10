import React from "react";
import { MailCheck } from "lucide-react";
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";

interface CheckYourEmailNoticeProps {
  message: string;
  onResend: () => void;
  isResending: boolean;
  secondsLeft: number;
  className?: string;
  compact?: boolean;
}

/** Shared "check your email" confirmation with a resend cooldown button. */
const CheckYourEmailNotice: React.FC<CheckYourEmailNoticeProps> = ({
  message,
  onResend,
  isResending,
  secondsLeft,
  className = "",
  compact = false,
}) => {
  const canResend = secondsLeft === 0 && !isResending;

  return (
    <div
      className={
        compact
          ? `flex w-full flex-wrap items-center gap-3 text-left ${className}`
          : `flex w-full items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-left ${className}`
      }
    >
      {compact ? (
        <p className="flex min-w-[12rem] flex-1 items-start gap-2 text-sm leading-5 text-[#424245]">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0071e3]" aria-hidden="true" />
          <span>{message}</span>
        </p>
      ) : (
        <>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
            <MailCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-900">Check your email</h2>
            <p className="mt-1 text-sm leading-5 text-gray-600">{message}</p>
          </div>
        </>
      )}
      <Button
        onClick={onResend}
        disabled={!canResend}
        buttonStyle={ButtonStyles.secondary}
        className={`!max-w-none !self-start px-3 py-2 text-sm ${compact ? "rounded-full" : "rounded-lg"}`}
        ariaLabel="Resend email"
      >
        {isResending ? "Sending..." : canResend ? "Resend email" : `Resend in ${secondsLeft}s`}
      </Button>
    </div>
  );
};

export default CheckYourEmailNotice;
