import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Home, User, Crown, CreditCard, HelpCircle, Download } from "lucide-react";
import { twMerge } from "tailwind-merge";
import AccountSettings from "./sections/AccountSettings/AccountSettings";
import Subscription from "./sections/Subscription";
import Billing from "./sections/Billing";
import HelpPage from "./sections/Help";
import Downloads from "./sections/Downloads";

type MenuOption = "account" | "access" | "billing" | "downloads" | "support";

const LEGACY_SECTION_MAP: Record<string, MenuOption> = {
  account: "account",
  subscription: "access",
  credits: "access",
  access: "access",
  billing: "billing",
  downloads: "downloads",
  help: "support",
  settings: "support",
  support: "support",
};

const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState<MenuOption>("account");
  const navigate = useNavigate();

  const menuItems: Array<{
    id: MenuOption;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: "account", label: "Account Settings", icon: <User className="w-4 h-4" /> },
    { id: "access", label: "Access & Plan", icon: <Crown className="w-4 h-4" /> },
    { id: "billing", label: "Payment History", icon: <CreditCard className="w-4 h-4" /> },
    { id: "downloads", label: "Downloads", icon: <Download className="w-4 h-4" /> },
    { id: "support", label: "Support", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const section = searchParams.get("section");
    const normalizedSection = section ? LEGACY_SECTION_MAP[section] : "account";

    if (!normalizedSection) {
      setActiveMenu("account");
      setSearchParams({ section: "account" }, { replace: true });
      return;
    }

    setActiveMenu(normalizedSection);

    if (section !== normalizedSection) {
      setSearchParams({ section: normalizedSection }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const selectMenu = (menu: MenuOption) => {
    // Use replace so switching sections doesn't pollute history, keeping Back navigation to the page before Settings
    setSearchParams({ section: menu }, { replace: true });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "account":
        return <AccountSettings />;
      case "access":
        return <Subscription />;
      case "billing":
        return <Billing />;
      case "downloads":
        return <Downloads />;
      case "support":
        return <HelpPage />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation Section */}
      <div className="w-80 border-r border-gray-200 bg-white p-6 overflow-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 mb-2"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Back</span>
        </button>

        {/* Home Link */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 mb-8"
        >
          <Home className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Home</span>
        </button>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Menu Items */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => selectMenu(item.id)}
                aria-label={item.id}
                className={twMerge(
                  "flex items-center cursor-pointer gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  activeMenu === item.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className={twMerge(
                  "flex items-center justify-center",
                  activeMenu === item.id ? "text-blue-600" : "text-gray-500"
                )}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-auto bg-gray-50">
        {/* Content */}
        <div className="px-12 py-8 overflow-auto height-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
