import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import AuthPageShell from "./AuthPageShell";
import CheckYourEmailNotice from "./CheckYourEmailNotice";
import { useResendCooldown } from "./hooks/useResendCooldown";
import ActionInputField from "./ActionInputField";
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { routes } from "../../router/routes";
import { passwordApi, toPasswordActionError } from "../../services/passwordApi";
import { useFormSubmission } from "../../hooks/Auth/useAuth";
import { useErrorStore } from "../../Store";
import { forgotPasswordSchema, ForgotPasswordFormData } from "./passwordValidation";

const FORM_ORIGIN = "forgotPassword";

const ForgotPassword: React.FC = () => {
  const location = useLocation();
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const { secondsLeft, start } = useResendCooldown(60);
  const clearError = () => useErrorStore.getState().removeFieldError({ param: "email", formOrigin: FORM_ORIGIN });

  const { mutate, isPending } = useMutation({
    mutationFn: async (targetEmail: string) => {
      await passwordApi.forgot(targetEmail);
    },
    onSuccess: () => {
      setRateLimited(false);
      setSubmitted(true);
      start();
    },
    onError: (error) => {
      const normalized = toPasswordActionError(error);
      if (normalized.status === 429) {
        setRateLimited(true);
        start();
      }
      // The backend always answers 200 for /forgot; a thrown error here means a
      // network/rate-limit problem, not "email not found" — still show the
      // neutral confirmation per the no-enumeration requirement, except for 429.
      if (normalized.status !== 429) {
        setSubmitted(true);
        start();
      }
    },
  });

  const handleSubmit = useFormSubmission(
    forgotPasswordSchema,
    (data: ForgotPasswordFormData) => mutate(data.email),
    (data: ForgotPasswordFormData) => ({ email: data.email.trim().toLowerCase() })
  );

  return (
    <AuthPageShell title="Forgot Password" headline="Let's get you a new password.">
      {successMessage && (
        <div className="w-full rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
          {successMessage}
        </div>
      )}

      {submitted ? (
        <>
          {rateLimited && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm" role="alert" aria-live="polite">
              Too many requests. Please wait before requesting another email.
            </div>
          )}
          <CheckYourEmailNotice
            className="w-full py-2"
            message="If an account exists for this email, a password reset link has been sent."
            onResend={() => mutate(email)}
            isResending={isPending}
            secondsLeft={secondsLeft}
          />
        </>
      ) : (
        <form
          className="w-full flex flex-col gap-3"
          name={FORM_ORIGIN}
          onSubmit={(e) => {
            if (isPending || secondsLeft > 0) {
              e.preventDefault();
              return;
            }
            handleSubmit({ email })(e);
          }}
          aria-label="Forgot password form"
        >
          <p className="text-sm text-gray-600 text-center">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>

          {rateLimited && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm" role="alert" aria-live="polite">
              Too many requests. Please wait before trying again.
            </div>
          )}

          <ActionInputField
            name="email"
            type="email"
            formOrigin={FORM_ORIGIN}
            label="Email"
            autoComplete="username"
            autoFocus
            placeholder="yourEmail@gmail.com"
            value={email}
            onFocus={clearError}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            onClick={() => {}}
            buttonStyle={ButtonStyles.primary}
            className="w-full h-12 py-2 mt-4 !max-w-none flex items-center justify-center gap-2"
            disabled={isPending || secondsLeft > 0}
            ariaLabel="Send reset link"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              rateLimited && secondsLeft > 0 ? `Try again in ${secondsLeft}s` : "Send reset link"
            )}
          </Button>
        </form>
      )}

      <p className="text-gray-600 text-sm text-center flex items-center gap-1">
        <ArrowLeft size={14} />
        <Link to={routes.login.path} className="text-[#237bff] font-semibold hover:text-[#1a5fcc] transition-colors duration-200">
          Back to Login
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default ForgotPassword;
