import { useMutation, useQueryClient } from "@tanstack/react-query"
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
    const queryClient = useQueryClient();

    return useMutation<{ subscriptionId: string; status: string }, ApiError, { setupIntentId: string, priceLookupKey: string }>({
        mutationFn: async ({ setupIntentId, priceLookupKey }) => {
            return (await StripeService.confirmSetupAndSubscribe(setupIntentId, priceLookupKey))
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}

export const useCancelSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation<{ status: string }, ApiError>({
        mutationFn: async () => {
            return await StripeService.cancelSubscription();
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    });
}

export const useResumeSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation<{ status: string }, ApiError>({
        mutationFn: async () => {
            return await StripeService.resumeSubscription();
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    });
}