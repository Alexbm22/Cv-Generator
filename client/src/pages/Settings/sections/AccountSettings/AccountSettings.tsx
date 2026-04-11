import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../Store";
import { Trash2, LogOut, Lock, AlertTriangle } from "lucide-react";
import { routes } from "../../../../router/routes";
import { ButtonStyles } from "../../../../constants/CV/buttonStyles";
import Button from "../../../../components/UI/Buttons/Button";
import { useLogout } from "../../../../hooks/Auth/useAuth";
import { UserServerService } from "../../../../services/UserServer";
import { ProfilePictureEditor } from "../../../../components/UI";

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  
  const { data: accountData, isLoading, error, refetch } = useQuery({
    queryKey: ['accountSettings'],
    queryFn: UserServerService.getAccountData.bind(UserServerService),
    enabled: useAuthStore.getState().isAuthenticated,
    retry: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const authProvider = useAuthStore((state) => state.authProvider);

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


      {/* Account Actions Section */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Account Actions</h2>

        <div className="flex gap-4">
          {authProvider === 'local' && (
            <Button
              onClick={() => navigate(routes.changePassword.path)}
              buttonStyle={ButtonStyles.primary}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </Button>
          )}
          <Button
            onClick={() => logout?.()}
            buttonStyle={ButtonStyles.secondary}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-colors duration-300 ease-in-out hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-5" />

        {/* Profile Picture Default Preference */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-800">Use profile picture as default for future CVs</span>
            <span className="text-xs text-gray-500">Automatically apply your profile picture when creating new CVs</span>
          </div>
          <button
            onClick={() => updateProfilePicturePreference(!accountData?.useProfilePictureAsDefault)}
            disabled={isUpdatingPreference}
            aria-label="Toggle profile picture as default for future CVs"
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              accountData?.useProfilePictureAsDefault ? 'bg-blue-500' : 'bg-gray-200'
            } ${
              isUpdatingPreference ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                accountData?.useProfilePictureAsDefault ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
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