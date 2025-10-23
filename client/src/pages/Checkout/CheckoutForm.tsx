import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { routes } from "../../router/routes";
import { useErrorStore } from "../../Store";

const CheckoutForm: React.FC = () => {
    
    const [processing, setProcessing] = useState(false);
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        
        setProcessing(true);
        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${import.meta.env.VITE_APP_BASE_URL}${routes.resumes.path}`,
            },
        });

        if (stripeError) {
            useErrorStore.getState().createError(stripeError);
        }

        setProcessing(false);
    }

    return  (
        <>
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <button
                    disabled={!stripe || processing}
                    type="submit"
                >
                    {processing ? 'Processing...' : 'Pay'}
                </button>
            </form>
        </>
    )
}

export default CheckoutForm;