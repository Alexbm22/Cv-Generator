import React, { useEffect, useState } from "react";
import { stripePromise } from "../../services/stripe";
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from "./CheckoutForm";
import { useParams } from "react-router-dom";
import { useCreatePaymentIntent } from "../../hooks/useStripe";

const CheckoutPage: React.FC = () => {

    const { priceId } = useParams<{priceId: string}>();
    const { mutate, isPending, isError } = useCreatePaymentIntent();
    const [ clientSecret, setClientSecret ] = useState<string>();

    useEffect(() => {
        if(priceId) {
            mutate(priceId, {
                onSuccess: (clientSecret) => setClientSecret(clientSecret)
            })
        }
    }, [mutate])

    return  (
        <>
            {
                clientSecret ? (
                    <Elements stripe={stripePromise} options={{clientSecret}}>
                        <CheckoutForm />
                    </Elements>
                ) : (
                    <div>Loading..</div>
                )
            }
        </>
        
    )
}

export default CheckoutPage;