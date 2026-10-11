import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ActionInputField from "./ActionInputField";

interface PasswordVisibilityFieldProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  formOrigin: string;
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  children?: React.ReactNode;
}

/** Password input with a show/hide toggle, reusing the shared auth Field component. */
const PasswordVisibilityField: React.FC<PasswordVisibilityFieldProps> = ({
  name,
  label,
  placeholder,
  value,
  formOrigin,
  autoComplete,
  autoFocus,
  onChange,
  onFocus,
  children,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <ActionInputField
      name={name}
      type={visible ? "text" : "password"}
      formOrigin={formOrigin}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="cursor-pointer text-gray-500 hover:text-[#237bff] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded transition-colors"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </ActionInputField>
  );
};

export default PasswordVisibilityField;
