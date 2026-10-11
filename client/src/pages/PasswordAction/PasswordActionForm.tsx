import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import AuthPageShell from "./AuthPageShell";
import InvalidOrExpiredState from "./InvalidOrExpiredState";
import PasswordVisibilityField from "./PasswordVisibilityField";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { routes } from "../../router/routes";
import { useAuthStore, useCVsStore } from "../../Store";
import { usePasswordActionSession } from "./hooks/usePasswordActionSession";
import { passwordApi, toPasswordActionError } from "../../services/passwordApi";
import { PasswordActionApiError, PasswordActionType } from "../../interfaces/passwordAction";
import {
  changePasswordActionSchema,
  ChangePasswordActionFormData,
  resetOrSetPasswordSchema,
  ResetOrSetPasswordFormData,
} from "./passwordValidation";
import { useFormSubmission } from "../../hooks/Auth/useAuth";
import { useErrorStore } from "../../Store";

interface PasswordActionFormProps {
  type: PasswordActionType;
}

const COPY: Record<PasswordActionType, { title: string; headline: string; submitLabel: string; successHint: string }> = {
  [PasswordActionType.RESET_PASSWORD]: {
    title: "Reset Password",
    headline: "Choose a new password to get back into your account.",
    submitLabel: "Reset password",
    successHint: "Your password has been reset. Please sign in again.",
  },
  [PasswordActionType.CHANGE_PASSWORD]: {
    title: "Change Password",
    headline: "Keep your account safe. Update your password regularly.",
    submitLabel: "Change password",
    successHint: "Your password has been changed. Please sign in again.",
  },
  [PasswordActionType.SET_PASSWORD]: {
    title: "Set Password",
    headline: "Add a password so you can also sign in without Google.",
    submitLabel: "Set password",
    successHint: "Your password has been set.",
  },
};

const errorMessageForCode = (error: PasswordActionApiError): string => {
  switch (error.code) {
    case "INVALID_PASSWORD": {
      if (error.policyErrors?.includes("TOO_SHORT")) return "Password is too short.";
      if (error.policyErrors?.includes("TOO_LONG")) return "Password is too long.";
      return "Password does not meet the requirements.";
    }
    case "INVALID_CURRENT_PASSWORD":
      return "Current password is incorrect.";
    case "SAME_PASSWORD":
      return "New password must differ from your current password.";
    case "NO_PASSWORD_SET":
    case "ALREADY_HAS_PASSWORD":
      return "This action is no longer available for your account.";
    default:
      if (error.status === 429) return "Too many attempts. Please wait a bit and try again.";
      return "Something went wrong. Please try again.";
  }
};

const formatCountdown = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Shared form for RESET_PASSWORD, CHANGE_PASSWORD, and SET_PASSWORD. Each
 * route page passes its expected `type`; if the live session doesn't match
 * (or there is no valid session), the generic invalid/expired state is shown.
 */
const PasswordActionForm: React.FC<PasswordActionFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuthenticatedUser = useAuthStore((state) => state.clearAuthenticatedUser);
  const setHasPassword = useAuthStore((state) => state.setHasPassword);
  const clearCVsData = useCVsStore((state) => state.clearCVsData);

  const { data: session, isLoading, isFetching, isError } = usePasswordActionSession();
  const sessionMatches = session?.type === type;

  const FORM_ORIGIN = `passwordAction_${type}`;
  const isChange = type === PasswordActionType.CHANGE_PASSWORD;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const clearFieldError = (param: string) =>
    useErrorStore.getState().removeFieldError({ param, formOrigin: FORM_ORIGIN });

  // Soft countdown hint derived from the session's expiry; switches to the
  // expired state locally once time is up (the next request would 401 anyway).
  const expiresAtMs = useMemo(() => (session ? new Date(session.expiresAt).getTime() : null), [session]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAtMs) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAtMs]);
  useEffect(() => {
    if (expiresAtMs && now >= expiresAtMs) setExpired(true);
  }, [expiresAtMs, now]);

  const { mutate: complete, isPending } = useMutation({
    mutationFn: async (input: { newPassword: string; currentPassword?: string }) => {
      await passwordApi.complete(input);
    },
    onSuccess: () => {
      if (type === PasswordActionType.SET_PASSWORD) {
        setHasPassword(true);
        navigate(`${routes.settings.path}?section=account`, {
          replace: true,
          state: { successMessage: COPY[type].successHint },
        });
        return;
      }
      // CHANGE_PASSWORD and RESET_PASSWORD both revoke the current session
      // server-side (token version bump), so the user must sign in again.
      clearAuthenticatedUser();
      clearCVsData();
      navigate(routes.login.path, { replace: true, state: { successMessage: COPY[type].successHint } });
    },
    onError: (error) => {
      const normalized = toPasswordActionError(error);
      if (normalized.status === 401 || normalized.code === "INVALID_SESSION" || normalized.code === "INVALID_TOKEN") {
        setExpired(true);
        return;
      }
      setSubmitError(errorMessageForCode(normalized));
    },
  });

  const { mutate: cancel } = useMutation({
    mutationFn: async () => {
      await passwordApi.cancel();
    },
  });

  const handleCancel = () => {
    cancel();
    navigate(isAuthenticated ? `${routes.settings.path}?section=account` : routes.login.path);
  };

  const handleResetOrSetSubmit = useFormSubmission(
    resetOrSetPasswordSchema,
    (data: ResetOrSetPasswordFormData) => {
      setSubmitError(null);
      complete({ newPassword: data.newPassword });
    },
    (data) => data
  );

  const handleChangeSubmit = useFormSubmission(
    changePasswordActionSchema,
    (data: ChangePasswordActionFormData) => {
      setSubmitError(null);
      complete({ newPassword: data.newPassword, currentPassword: data.currentPassword });
    },
    (data) => data
  );

  if (isLoading || isFetching) {
    return (
      <AuthPageShell title={COPY[type].title}>
        <div className="flex flex-col items-center gap-4 py-6">
          <LoadingSpinner size="md" />
          <p className="text-sm text-gray-600">Checking your session...</p>
        </div>
      </AuthPageShell>
    );
  }

  if (isError || !sessionMatches || expired) {
    return (
      <AuthPageShell title={COPY[type].title}>
        <InvalidOrExpiredState isAuthenticated={isAuthenticated} />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell title={COPY[type].title} headline={COPY[type].headline}>
      {type === PasswordActionType.SET_PASSWORD && (
        <p className="text-sm text-gray-600 text-center -mt-2">
          Your account currently signs in with Google only. Adding a password won't change that — Google sign-in will keep working.
        </p>
      )}

      <form
        className="w-full flex flex-col gap-5"
        name={FORM_ORIGIN}
        onSubmit={(e) => {
          if (isPending) {
            e.preventDefault();
            return;
          }
          (isChange
            ? handleChangeSubmit({ currentPassword, newPassword, confirmNewPassword })
            : handleResetOrSetSubmit({ newPassword, confirmNewPassword }))(e);
        }}
        aria-label={`${COPY[type].title} form`}
      >
        {expiresAtMs && (
          <p className="text-xs text-gray-500 text-center" aria-live="polite">
            This session expires in {formatCountdown(expiresAtMs - now)}
          </p>
        )}

        {isChange && (
          <PasswordVisibilityField
            name="currentPassword"
            label="Current Password"
            autoComplete="current-password"
            autoFocus
            formOrigin={FORM_ORIGIN}
            placeholder="Enter your current password"
            value={currentPassword}
            onFocus={() => clearFieldError("currentPassword")}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        )}

        <PasswordVisibilityField
          name="newPassword"
          label="New Password"
          autoComplete="new-password"
          autoFocus={!isChange}
          formOrigin={FORM_ORIGIN}
          placeholder="Enter your new password"
          value={newPassword}
          onFocus={() => clearFieldError("newPassword")}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <PasswordVisibilityField
          name="confirmNewPassword"
          label="Confirm New Password"
          autoComplete="new-password"
          formOrigin={FORM_ORIGIN}
          placeholder="Re-enter your new password"
          value={confirmNewPassword}
          onFocus={() => clearFieldError("confirmNewPassword")}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />

        {submitError && (
          <div
            className="w-full flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/80 px-3.5 py-3 text-sm leading-5 text-red-700"
            role="alert"
            aria-live="assertive"
          >
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <Button
          type="submit"
          onClick={() => {}}
          buttonStyle={ButtonStyles.primary}
          className="w-full h-12 py-2 mt-2 !max-w-none flex items-center justify-center gap-2"
          disabled={isPending}
          ariaLabel={COPY[type].submitLabel}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            COPY[type].submitLabel
          )}
        </Button>

        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </form>
    </AuthPageShell>
  );
};

export default PasswordActionForm;
