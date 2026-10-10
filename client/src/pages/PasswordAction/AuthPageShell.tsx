import React from "react";
import bg from "../../assets/Images/login-bg.png";

interface AuthPageShellProps {
  title: string;
  headline?: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

/**
 * Shared full-screen shell for the password action pages, reusing the same
 * background photo / serif heading / white card visual language as the
 * existing Login, SignUp, and legacy ChangePassword pages.
 */
const AuthPageShell: React.FC<AuthPageShellProps> = ({
  title,
  headline,
  children,
  maxWidthClassName = "max-w-lg",
}) => {
  return (
    <div
      style={{ backgroundImage: `url(${bg})` }}
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8 relative overflow-hidden before:absolute before:inset-0 before:bg-black/40"
    >
      <div className="absolute inset-0 bg-[#13025965]" />

      {headline && (
        <h1 className="hidden mr-auto ml-100 transform -translate-x-1/2 text-white font-serif text-2xl md:text-4xl font-semibold text-center max-w-md z-10 md:flex">
          {headline}
        </h1>
      )}

      <div
        className={`flex flex-col items-center bg-white p-8 px-9 rounded-2xl shadow-2xl w-full ${maxWidthClassName} gap-4 relative z-20 ${
          headline ? "md:mr-40 lg:mr-50" : ""
        }`}
      >
        <h1 className="font-serif text-4xl text-[#00409f] text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default AuthPageShell;
