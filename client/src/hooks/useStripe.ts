import { useMutation } from "@tanstack/react-query"
import { ApiError } from "../interfaces/error"
import { StripeService } from "../services/stripe"
import { useErrorStore } from "../Store"

export const useCreatePaymentIntent = () => {
    return useMutation<string, ApiError, { priceLookupKey: string, quantity?: number }>({
        mutationFn: async ({ priceLookupKey, quantity = 1 }) => {
            return (await StripeService.createPaymentIntent(priceLookupKey, quantity))
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}

export const useCreateSubscriptionCheckout = () => {
    return useMutation<string, ApiError, { priceLookupKey: string }>({
        mutationFn: async ({ priceLookupKey }) => {
            return (await StripeService.createSubscriptionCheckout(priceLookupKey))
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}

export const useConfirmSetupAndSubscribe = () => {
    return useMutation<{ subscriptionId: string; status: string }, ApiError, { setupIntentId: string, priceLookupKey: string }>({
        mutationFn: async ({ setupIntentId, priceLookupKey }) => {
            return (await StripeService.confirmSetupAndSubscribe(setupIntentId, priceLookupKey))
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}