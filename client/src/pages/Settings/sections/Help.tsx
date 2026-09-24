import React from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, CreditCard, FileDown, LifeBuoy } from "lucide-react";
import Button from "../../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";
import { routes } from "../../../router/routes";

const HelpContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
        <p className="mt-1 text-sm text-gray-500">Quick guidance for billing, credits, and export access behavior.</p>
      </div>

      <div className="border-b border-gray-200" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <CircleHelp className="w-4 h-4 text-gray-500" />
          Frequently asked billing questions
        </h2>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-medium text-gray-900">When are credits consumed?</p>
            <p className="mt-1 text-gray-600">Credits are used only when you export without active subscription benefits.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">What happens after I cancel my subscription?</p>
            <p className="mt-1 text-gray-600">Cancellation stops auto-renewal, but your full access remains active until the current period ends.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Why can status updates take a moment?</p>
            <p className="mt-1 text-gray-600">Payment and subscription events are synced from Stripe webhooks and can take a short time to appear.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-gray-500" />
          Quick actions
        </h2>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate(routes.plans.path)}
            buttonStyle={ButtonStyles.primary}
            className="!rounded-lg !px-4 !py-2 flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>View Plans</span>
          </Button>

          <Button
            onClick={() => navigate(`${routes.settings.path}?section=downloads`)}
            buttonStyle={ButtonStyles.secondary}
            className="!rounded-lg !px-4 !py-2 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            <span>Open Downloads</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HelpContent;
