import React, { useEffect, useState } from "react";
import { stripePromise } from "../../services/stripe";
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from "./CheckoutForm";
import { useParams, useSearchParams } from "react-router-dom";
import { useCreatePaymentIntent, useCreateSubscriptionCheckout } from "../../hooks/useStripe";
import { LoadingSpinner } from "../../components/UI/LoadingSpinner";
import { TRIAL_LOOKUP_KEY } from "../../constants/plans";

const CheckoutPage: React.FC = () => {

    const { price_lookup_key } = useParams<{price_lookup_key: string}>();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') ?? undefined;

    const { mutate: createPaymentIntent } = useCreatePaymentIntent();
    const { mutate: createSubscriptionCheckout } = useCreateSubscriptionCheckout();
    const [ clientSecret, setClientSecret ] = useState<string>();

    useEffect(() => {
        if(!price_lookup_key) return;

        if(mode === 'subscription') {
            createSubscriptionCheckout(
                { priceLookupKey: price_lookup_key },
                { onSuccess: (clientSecret) => setClientSecret(clientSecret) }
            )
        } else {
            createPaymentIntent({ priceLookupKey: price_lookup_key, quantity: 1 }, {
                onSuccess: (clientSecret) => setClientSecret(clientSecret)
            })
        }
    }, [price_lookup_key, searchParams, mode, createPaymentIntent, createSubscriptionCheckout]);

    if (!mode || (mode !== 'subscription' && mode !== 'payment')) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6">
                    <h1 className="font-serif text-3xl text-[#00409f]">
                        Invalid mode
                    </h1>
                    <p className="text-center text-gray-600">
                        The mode parameter is missing or invalid. Please check the URL and try again.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6">
                <h1 className="font-serif text-3xl text-[#00409f]">
                    {mode === 'subscription'
                        ? (price_lookup_key === TRIAL_LOOKUP_KEY ? 'Start your trial' : 'Subscribe')
                        : 'Checkout'}
                </h1>

                {!clientSecret ? (
                    <LoadingSpinner size="lg" />
                ) : (
                    <Elements stripe={stripePromise} options={{clientSecret}}>
                        <CheckoutForm mode={mode} priceLookupKey={price_lookup_key!} clientSecret={clientSecret} />
                    </Elements>
                )}
            </div>
        </div>
    )
}

export default CheckoutPage;