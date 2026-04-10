import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Check, X as XIcon, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useChangePassword } from "../../hooks/Auth/useChangePassword";
import ConfirmationDialog from "../../components/UI/ConfirmationDialog";
import Field from "../../components/features/AuthForm/formField";
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { routes } from "../../router/routes";
import bg from "../../assets/Images/login-bg.png";

const ChangePassword: React.FC = () => {
  const {
    formData,
    handleInputChange,
    passwordsMatch,
    passwordsMismatch,
    isFormValid,
    isConfirmDialogOpen,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
    isPending,
    error,
    clearError
  } = useChangePassword();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormValid) {
      openConfirmDialog();
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${bg})` }}
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8 relative overflow-hidden before:absolute before:inset-0 before:bg-black/40"
    >
      <div className="absolute inset-0 bg-[#13025965]" />

      {/* Left motivational text — hidden on small screens */}
      <h1 className="hidden mr-auto ml-100 transform -translate-x-1/2 text-white font-serif text-2xl md:text-4xl font-semibold text-center max-w-md z-10 md:flex">
        Keep your account safe. Update your password regularly.
      </h1>

      {/* Form card */}
      <div className="flex flex-col items-center bg-white p-8 px-9 rounded-2xl shadow-2xl w-full max-w-lg gap-4 md:mr-40 lg:mr-50 relative z-20">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="font-serif text-4xl text-[#00409f]">
            Change Password
          </h1>
        </div>

        <form
          className="w-full flex flex-col gap-5"
          name="changePassword"
          onSubmit={handleFormSubmit}
          aria-label="Change password form"
        >
          {/* Error Banner */}
          {error && (
            <div className="w-full rounded-lg bg-red-400 px-4 py-3 text-white text-sm">
              {error}
            </div>
          )}

          {/* Current Password */}
          <div className="relative w-full h-fit">
            <Field
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              formOrigin="changePassword"
              label="Current Password"
              className="gap-1"
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onFocus={() => clearError()}
              onChange={handleInputChange}
            >
              <button
                type="button"
                onClick={() => setShowCurrentPassword((p) => !p)}
                className="cursor-pointer text-gray-500 hover:text-[#237bff] focus:outline-none transition-colors"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </Field>
          </div>

          {/* New Password */}
          <div className="relative w-full h-fit">
            <Field
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              formOrigin="changePassword"
              label="New Password"
              className="gap-1"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              onFocus={() => clearError()}
            >
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="cursor-pointer text-gray-500 hover:text-[#237bff] focus:outline-none transition-colors"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </Field>
            <p className="text-xs text-gray-500 mt-1 px-1">
              Password must contain: uppercase, lowercase, number, and be at least 5 characters
            </p>
          </div>

          {/* Confirm New Password */}
          <div className="relative w-full h-fit">
            <Field
              name="confirmNewPassword"
              type={showConfirmPassword ? "text" : "password"}
              formOrigin="changePassword"
              label="Confirm New Password"
              className="gap-1"
              placeholder="Re-enter your new password"
              value={formData.confirmNewPassword}
              onChange={handleInputChange}
              onFocus={() => clearError()}
            >
              <div className="flex items-center gap-1.5">
                {/* Live match indicator */}
                {passwordsMatch && (
                  <Check size={18} className="text-green-500" aria-label="Passwords match" />
                )}
                {passwordsMismatch && (
                  <XIcon size={18} className="text-red-500" aria-label="Passwords do not match" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="cursor-pointer text-gray-500 hover:text-[#237bff] focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </Field>
            {/* Live validation message */}
            {passwordsMatch && (
              <p className="text-xs text-green-600 mt-1 px-1">Passwords match</p>
            )}
            {passwordsMismatch && (
              <p className="text-xs text-red-500 mt-1 px-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            onClick={() => {}}
            buttonStyle={ButtonStyles.primary}
            className="w-full h-12 py-2 mt-4 !max-w-none flex items-center justify-center gap-2"
            disabled={!isFormValid || isPending}
            ariaLabel="Save new password"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </form>

        {/* Back link */}
        <p className="text-gray-600 text-sm text-center flex items-center gap-1">
          <ArrowLeft size={14} className="mt-[3px]"/>
          <Link
            to={`${routes.settings.path}?section=account`}
            className="text-[#237bff] font-semibold hover:text-[#1a5fcc] transition-colors duration-200"
          >
            Back to Account Settings
          </Link>
        </p>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirm}
        title="Confirm Password Change"
        description="Are you sure you want to change your password?"
        warnings={[
          "You will be logged out from all devices",
          "You will need to sign in again with your new password",
        ]}
        confirmLabel="Change Password"
        cancelLabel="Cancel"
        isLoading={isPending}
      />
    </div>
  );
};

export default ChangePassword;
