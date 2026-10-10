import * as yup from "yup";

export interface ForgotPasswordFormData {
  email: string;
}

export const forgotPasswordSchema = yup.object<ForgotPasswordFormData>({
  email: yup
    .string()
    .required("Email is required!")
    .email("Invalid email address!"),
});

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;

const passwordLengthError = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const length = Array.from(value).length;
  if (length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters!`;
  }
  if (length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters!`;
  }
  return undefined;
};

const passwordSchema = () =>
  yup
    .string()
    .required("New password is required!")
    .test("unicode-password-length", function (value) {
      const message = passwordLengthError(value);
      return message ? this.createError({ message }) : true;
    });

export interface ResetOrSetPasswordFormData {
  newPassword: string;
  confirmNewPassword: string;
}

export const resetOrSetPasswordSchema = yup.object<ResetOrSetPasswordFormData>({
  newPassword: passwordSchema(),
  confirmNewPassword: yup
    .string()
    .required("Please confirm your new password!")
    .oneOf([yup.ref("newPassword")], "Passwords do not match!"),
});

export interface ChangePasswordActionFormData extends ResetOrSetPasswordFormData {
  currentPassword: string;
}

export const changePasswordActionSchema = yup.object<ChangePasswordActionFormData>({
  currentPassword: yup.string().required("Current password is required!"),
  newPassword: passwordSchema().notOneOf(
    [yup.ref("currentPassword")],
    "New password must differ from the current password!"
  ),
  confirmNewPassword: yup
    .string()
    .required("Please confirm your new password!")
    .oneOf([yup.ref("newPassword")], "Passwords do not match!"),
});
