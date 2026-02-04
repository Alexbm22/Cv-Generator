import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Home, User, Crown, Zap, CreditCard, Settings, HelpCircle, Download } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import AccountSettings from "./sections/AccountSettings";
import Subscription from "./sections/Subscription";
import DownloadCredits from "./sections/DownloadCredits";
import Billing from "./sections/Billing";
import SettingsContent from "./sections/GeneralSettings";
import HelpPage from "./sections/Help";
import Downloads from "./sections/Downloads";

type MenuOption = "account" | "subscription" | "credits" | "billing" | "downloads" | "settings" | "help";

const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeMenu, setActiveMenu] = useState<MenuOption>("account");
  const navigate = useNavigate();

  // Read the section from query params on mount or when they change
  useEffect(() => {
    const section = searchParams.get("section") as MenuOption | null;
    if (section && sectionsMap.includes(section)) {
      setActiveMenu(section);
    }
  }, [searchParams]);

  const menuItems: Array<{
    id: MenuOption;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: "account", label: "Account Settings", icon: <User className="w-4 h-4" /> },
    { id: "subscription", label: "Subscription", icon: <Crown className="w-4 h-4" /> },
    { id: "credits", label: "Download Credits", icon: <Zap className="w-4 h-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
    { id: "downloads", label: "Downloads", icon: <Download className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
    { id: "help", label: "Help", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const sectionsMap: string[] = menuItems.map(item => item.id);

  const renderContent = () => {
    switch (activeMenu) {
      case "account":
        return <AccountSettings />;
      case "subscription":
        return <Subscription />;
      case "credits":
        return <DownloadCredits />;
      case "billing":
        return <Billing />;
      case "downloads":
        return <Downloads />;
      case "settings":
        return <SettingsContent />;
      case "help":
        return <HelpPage />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Navigation Section */}
      <div className="w-64 border-r border-gray-200 bg-white p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={twMerge(
            ButtonStyles.navigationMenu,
            "mb-1"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Home Link */}
        <button
          onClick={() => navigate("/")}
          className={twMerge(
            ButtonStyles.navigationMenu,
            "mb-6"
          )}
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </button>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.id === "settings" && (
                <div className="border-t border-gray-200 my-4" />
              )}
              <button
                onClick={() => setActiveMenu(item.id)}
                aria-label={item.id}
                className={twMerge(
                  ButtonStyles.navigationMenu,
                  activeMenu === item.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : ""
                )}
              >
                <span className={twMerge(
                  "flex items-center justify-center",
                  activeMenu === item.id ? "text-blue-600" : "text-gray-600"
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
      <div className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;
