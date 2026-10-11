import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../../../Store";
import { Trash2, LogOut, Lock, KeyRound, AlertTriangle, CircleCheck } from "lucide-react";
import { ButtonStyles } from "../../../../constants/CV/buttonStyles";
import Button from "../../../../components/UI/Buttons/Button";
import { useLogout } from "../../../../hooks/Auth/useAuth";
import { UserServerService } from "../../../../services/UserServer";
import { ProfilePictureEditor } from "../../../../components/UI";
import { passwordApi, toPasswordActionError } from "../../../../services/passwordApi";
import CheckYourEmailNotice from "../../../PasswordAction/CheckYourEmailNotice";
import { useResendCooldown } from "../../../PasswordAction/hooks/useResendCooldown";
import { AuthService } from "../../../../services/auth";

const AccountSettings: React.FC = () => {
  const { mutate: logout } = useLogout();
  const location = useLocation();
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  const { data: accountData, isLoading, error, refetch } = useQuery({
    queryKey: ['accountSettings'],
    queryFn: UserServerService.getAccountData.bind(UserServerService),
    enabled: useAuthStore.getState().isAuthenticated,
    retry: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasPassword = useAuthStore((state) => state.hasPassword);

  const [passwordActionEmailSent, setPasswordActionEmailSent] = useState(false);
  const [passwordActionErrorMessage, setPasswordActionErrorMessage] = useState<string | null>(null);
  const { secondsLeft, start } = useResendCooldown(60);

  const { mutate: requestPasswordAction, isPending: isRequestingPasswordAction } = useMutation({
    mutationFn: async () => {
      if (hasPassword) {
        await passwordApi.requestChange();
      } else {
        await passwordApi.requestSet();
      }
    },
    onSuccess: () => {
      setPasswordActionErrorMessage(null);
      setPasswordActionEmailSent(true);
      start();
    },
    onError: (error) => {
      const normalized = toPasswordActionError(error);
      if (normalized.status === 409) {
        setPasswordActionErrorMessage("Your account state changed. Refreshing your account status...");
        void Promise.all([
          refetch(),
          AuthService.checkAuth().then((authResponse) => {
            useAuthStore.getState().handleAuthSuccess(authResponse);
            setPasswordActionErrorMessage(null);
          }),
        ]).catch(() => {
          setPasswordActionErrorMessage("Your account state changed, but we couldn't refresh it. Reload the page and try again.");
        });
      } else if (normalized.status === 429) {
        setPasswordActionErrorMessage("Too many requests. Please wait a bit before trying again.");
        start();
      } else {
        setPasswordActionErrorMessage("Something went wrong. Please try again.");
      }
    },
  });

  const { mutate: updateProfilePicturePreference, isPending: isUpdatingPreference } = useMutation<void, unknown, boolean>({
    mutationFn: (value: boolean) => UserServerService.updateProfilePicturePreference(value),
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Failed to update profile picture preference:", error);
    }
  });

  if (isLoading) return <div className="text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-600">Error loading account data</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Account Settings
      </h1>

      {successMessage && (
        <div role="status" aria-live="polite" className="flex items-center justify-start gap-2 text-sm text-gray-600">
          <CircleCheck size={15} strokeWidth={1.75} className="shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Separator */}
      <div className="border-b border-gray-200" />

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center justify-center gap-4 w-full sm:w-[30%]">
          <ProfilePictureEditor />
        </div>

        {/* Account Information Section */}
        <section className="bg-white rounded-xl border w-full border-gray-200 p-8 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-8">Account Information</h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Email */}
            <div className="overflow-hidden">
              <label className="text-sm font-medium text-gray-700 block mb-3">Email</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm truncate">
                {accountData?.email}
              </div>
            </div>

            {/* Username */}
            <div className="overflow-hidden">
              <label className="text-sm font-medium text-gray-700 block mb-3">Username</label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm truncate">
                {accountData?.username}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-2">Active CVs</label>
              <div className="text-3xl font-semibold text-gray-900">
                {accountData?.activeCVs || 0}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-2">Total Downloads</label>
              <div className="text-3xl font-semibold text-gray-900">
                {accountData?.totalDownloads || 0}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-5">Member Since</label>
              <div className="text-sm font-medium text-gray-900 mt-auto">
                {accountData?.memberSince || ""}
              </div>
            </div>
          </div>
        </section>
      </div>


      <section className="overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white shadow-sm">
        <div className="px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">Account Actions</h2>
          <p className="mt-1 text-sm text-[#86868b]">Manage your sign-in and account preferences.</p>
        </div>

        <div className="border-t border-[#f2f2f7] px-5 sm:px-6">
          <div className="flex items-start gap-4 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#0071e3]">
              {hasPassword ? <Lock className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">Password</h3>
                  <p className="mt-1 text-sm leading-5 text-[#86868b]">
                    {hasPassword
                      ? "Update the password for your account."
                      : "Your account uses Google sign-in. Adding a password won't change that."}
                  </p>
                </div>
                {!passwordActionEmailSent && (
                  <Button
                    onClick={() => requestPasswordAction()}
                    disabled={isRequestingPasswordAction || secondsLeft > 0}
                    buttonStyle={ButtonStyles.primary}
                    className="flex items-center gap-2 !max-w-none rounded-full px-4 py-2 text-sm"
                  >
                    {isRequestingPasswordAction
                      ? "Sending..."
                      : secondsLeft > 0 && passwordActionErrorMessage
                        ? `Try again in ${secondsLeft}s`
                        : hasPassword
                          ? "Change Password"
                          : "Set Password"}
                  </Button>
                )}
              </div>

              {passwordActionErrorMessage && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {passwordActionErrorMessage}
                </div>
              )}

              {passwordActionEmailSent && (
                <CheckYourEmailNotice
                  compact
                  className="mt-3"
                  message={
                    hasPassword
                      ? "Check your email for a link to change your password."
                      : "Check your email for a link to set a password for your account."
                  }
                  onResend={() => requestPasswordAction()}
                  isResending={isRequestingPasswordAction}
                  secondsLeft={secondsLeft}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-[#f2f2f7] py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73]">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Sign Out</h3>
              <p className="mt-1 text-sm text-[#86868b]">Sign out of your account on this device.</p>
            </div>
            <Button
              onClick={() => logout?.()}
              buttonStyle={ButtonStyles.secondary}
              className="flex items-center gap-2 !max-w-none rounded-full px-4 py-2 text-sm !text-[#d70015] hover:!bg-[#fff2f2] hover:!text-[#b00020]"
            >
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-[#f2f2f7] py-5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Use profile picture by default</h3>
              <p className="mt-1 text-sm text-[#86868b]">
                Automatically apply it when creating new CVs.
              </p>
            </div>
            <button
              onClick={() => updateProfilePicturePreference(!accountData?.useProfilePictureAsDefault)}
              disabled={isUpdatingPreference}
              role="switch"
              aria-checked={Boolean(accountData?.useProfilePictureAsDefault)}
              aria-label="Toggle profile picture as default for future CVs"
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 ${
                accountData?.useProfilePictureAsDefault ? "bg-[#34c759]" : "bg-[#d2d2d7]"
              } ${isUpdatingPreference ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                  accountData?.useProfilePictureAsDefault ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Delete Account Section */}
      <section className="bg-red-50/60 border border-red-200 rounded-xl p-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-semibold text-red-900">Delete Account</h2>
          </div>
          <p className="text-sm text-red-800/90">
            This action is permanent. Your account data, CVs, and downloads will be deleted and cannot be recovered.
          </p>
          <Button
            onClick={() => {}}
            buttonStyle="cursor-pointer font-medium text-white bg-red-600 hover:bg-red-700 py-2.5 px-5 rounded-lg transition-colors duration-300 ease-in-out text-sm"
            className="flex items-center gap-2 w-fit"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AccountSettings;