import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { APIError } from "../../interfaces/api";
import { routes } from "../../router/routes";
import { useAuthStore, useCVsStore } from "../../Store";
import { UserServerService } from "../../services/UserServer";
import { AxiosError } from "axios";

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const initialFormData: ChangePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export const useChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ChangePasswordFormData>(initialFormData);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [error, setError] = useState<string | null>(null);

  const passwordsMatch =
    formData.newPassword.length > 0 &&
    formData.confirmNewPassword.length > 0 &&
    formData.newPassword === formData.confirmNewPassword;

  const passwordsMismatch =
    formData.confirmNewPassword.length > 0 &&
    formData.newPassword !== formData.confirmNewPassword;

  const isFormValid =
    formData.currentPassword.length > 0 &&
    formData.newPassword.length >= 5 &&
    passwordsMatch;

  const openConfirmDialog = () => setIsConfirmDialogOpen(true);
  const closeConfirmDialog = () => setIsConfirmDialogOpen(false);

  const mutation = useMutation<void, AxiosError, ChangePasswordFormData>({
    mutationFn: async (data) => {
      await UserServerService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      useAuthStore.getState().clearAuthenticatedUser();
      useCVsStore.getState().clearCVsData();
      navigate(routes.login.path);
    },
    onError: (error) => {
      const message = (error as APIError).response?.data?.message || "An error occurred while changing password.";
      setError(message);
    }
  });

  const handleConfirm = () => {
    closeConfirmDialog();
    mutation.mutate(formData);
  };

  return {
    formData,
    handleInputChange,
    passwordsMatch,
    passwordsMismatch,
    isFormValid,
    isConfirmDialogOpen,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
    isPending: mutation.isPending,
    error,
    clearError: () => setError(null)
  };
};
