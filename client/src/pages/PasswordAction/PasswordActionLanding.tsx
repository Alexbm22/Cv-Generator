import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import AuthPageShell from "./AuthPageShell";
import InvalidOrExpiredState from "./InvalidOrExpiredState";
import { passwordApi } from "../../services/passwordApi";
import { PasswordActionType } from "../../interfaces/passwordAction";
import { routes } from "../../router/routes";
import { useAuthStore } from "../../Store";

type LandingState = "checking" | "invalid";

const pathForActionType = (type: PasswordActionType): string => {
  switch (type) {
    case PasswordActionType.RESET_PASSWORD:
      return routes.passwordReset.path;
    case PasswordActionType.CHANGE_PASSWORD:
      return routes.passwordChange.path;
    case PasswordActionType.SET_PASSWORD:
      return routes.passwordSet.path;
    default:
      return routes.passwordForgot.path;
  }
};

/**
 * Landing page for emailed password-action links (`/password/action#token=...`).
 * Exchanges the one-time token for an HttpOnly session cookie exactly once,
 * then redirects to the matching form page.
 */
const PasswordActionLanding: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [state, setState] = useState<LandingState>("checking");
  const hasRunRef = useRef(false);

  useLayoutEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      // Read and immediately strip the token from the URL so it never lingers
      // in browser history, referrer headers, or gets accidentally shared.
      const hash = window.location.hash;
      if (hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      const token = new URLSearchParams(hash.replace(/^#/, "")).get("token");

      if (token) {
        try {
          const { type } = await passwordApi.exchange(token);
          const targetPath = pathForActionType(type);
          if (targetPath === routes.passwordForgot.path) {
            setState("invalid");
            return;
          }
          navigate(targetPath, { replace: true });
        } catch {
          setState("invalid");
        }
        return;
      }

      // No token in the fragment — likely a refresh after a successful
      // exchange. Fall back to checking whether a session cookie is valid.
      try {
        const session = await passwordApi.getSession();
        const targetPath = pathForActionType(session.type);
        if (targetPath === routes.passwordForgot.path) {
          setState("invalid");
          return;
        }
        navigate(targetPath, { replace: true });
      } catch {
        setState("invalid");
      }
    };

    void run();
  }, [navigate]);

  return (
    <AuthPageShell title="Password Action" headline="Just a moment while we verify your link.">
      {state === "checking" ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <LoadingSpinner size="md" />
          <p className="text-sm text-gray-600">Verifying your link...</p>
        </div>
      ) : (
        <InvalidOrExpiredState isAuthenticated={isAuthenticated} />
      )}
    </AuthPageShell>
  );
};

export default PasswordActionLanding;
