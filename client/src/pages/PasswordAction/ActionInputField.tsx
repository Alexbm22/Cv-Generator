import React from "react";
import { useErrorStore } from "../../Store";

interface ActionInputFieldProps {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  formOrigin: string;
  autoComplete?: string;
  autoFocus?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  children?: React.ReactNode;
}

/** Accessible input used only by the password-action screens. */
const ActionInputField: React.FC<ActionInputFieldProps> = ({
  name,
  label,
  type,
  placeholder,
  value,
  formOrigin,
  autoComplete,
  autoFocus,
  onChange,
  onFocus,
  children,
}) => {
  const error = useErrorStore((state) =>
    state.errors.find((entry) => entry.field?.param === name && entry.field?.formOrigin === formOrigin)
  );
  const removeFieldError = useErrorStore((state) => state.removeFieldError);
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-base text-gray-600 font-bold">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onFocus={onFocus}
          onChange={(event) => {
            onChange(event);
            removeFieldError({ param: name, formOrigin });
          }}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full h-11 font-medium text-gray-600 px-4 py-2 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        {children && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
            {children}
          </div>
        )}
      </div>
      {error?.message && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default ActionInputField;
