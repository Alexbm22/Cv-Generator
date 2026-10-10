import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { routes } from "../../router/routes";

interface InvalidOrExpiredStateProps {
  isAuthenticated: boolean;
}

/**
 * Single, generic "link invalid or expired" state. Intentionally never
 * distinguishes *why* the link/session is invalid (used token, expired,
 * revoked, wrong type, malformed, ...).
 */
const InvalidOrExpiredState: React.FC<InvalidOrExpiredStateProps> = ({ isAuthenticated }) => {
  const requestNewLinkPath = isAuthenticated
    ? `${routes.settings.path}?section=account`
    : routes.passwordForgot.path;

  return (
    <div className="flex flex-col items-center gap-4 text-center w-full">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
        <ShieldAlert className="w-7 h-7 text-amber-500" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900">This link is invalid or has expired</h2>
        <p className="text-sm text-gray-600">
          Please request a new link to continue.
        </p>
      </div>
      <Link to={requestNewLinkPath} className="w-full">
        <Button
          onClick={() => {}}
          buttonStyle={ButtonStyles.primary}
          className="w-full h-11 flex items-center justify-center !max-w-none"
        >
          {isAuthenticated ? "Go to Account Settings" : "Request a new link"}
        </Button>
      </Link>
    </div>
  );
};

export default InvalidOrExpiredState;
