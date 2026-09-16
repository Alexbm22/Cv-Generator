import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { routes } from "../../router/routes";
import { useErrorStore } from "../../Store";
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { useConfirmSetupAndSubscribe } from "../../hooks/useStripe";
import { useNavigate } from "react-router-dom";

interface CheckoutFormProps {
  mode: string;
  priceLookupKey: string;
  clientSecret: string;
}

interface SetupIntentResult {
  error?: { message: string };
  setupIntent?: { id: string };
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ mode, priceLookupKey, clientSecret }) => {
    
    const [processing, setProcessing] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { mutate: confirmSetupAndSubscribe } = useConfirmSetupAndSubscribe();

    const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        
        setProcessing(true);

        if (mode === 'subscription') {
            // SetupIntent flow for subscriptions
            try {
                // Step 1: Submit the form elements first (required by Stripe)
                const submitResult = await elements.submit();
                if (submitResult.error) {
                    useErrorStore.getState().createError(submitResult.error);
                    console.error('Form validation error:', submitResult.error);
                    setProcessing(false);
                    return;
                }

                // Step 2: Confirm the SetupIntent
                const setupResult = (await stripe.confirmSetup({
                    elements,
                    clientSecret,
                    confirmParams: {
                        return_url: `${import.meta.env.VITE_APP_BASE_URL}${routes.resumes.path}`
                    },
                    redirect: 'if_required'
                })) as SetupIntentResult;

                if (setupResult.error) {
                    useErrorStore.getState().createError(setupResult.error);
                    setProcessing(false);
                    return;
                }

                const setupIntentId = setupResult.setupIntent?.id;
                if (!setupIntentId) {
                    useErrorStore.getState().createError({
                        message: 'Failed to confirm payment method.'
                    });
                    setProcessing(false);
                    return;
                }

                // Step 3: Call backend to attach payment method and create subscription
                confirmSetupAndSubscribe(
                    {
                        setupIntentId,
                        priceLookupKey
                    },
                    {
                        onSuccess: () => {
                            // Redirect to resumes page after subscription is confirmed
                            navigate(routes.resumes.path);
                        },
                        onError: () => {
                            // Error is already handled by useErrorStore in the hook
                            setProcessing(false);
                        }
                    }
                );
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                useErrorStore.getState().createError({ message: errorMessage });
                setProcessing(false);
            }
        } else {
            // PaymentIntent flow for one-time payments (original flow)
            const confirmParams = {
                return_url: `${import.meta.env.VITE_APP_BASE_URL}${routes.resumes.path}`,
            };

            const { error: stripeError } = await stripe.confirmPayment({ elements, confirmParams });

            if (stripeError) {
                useErrorStore.getState().createError(stripeError);
            }

            setProcessing(false);
        }
    }

    return  (
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <PaymentElement />
            <Button
                type="submit"
                onClick={() => {}}
                disabled={!stripe || processing}
                buttonStyle={ButtonStyles.primary}
                className="!text-base !py-2 !px-6 self-center"
            >
                {processing ? 'Processing...' : 'Pay'}
            </Button>
        </form>
    )
}

export default CheckoutForm;