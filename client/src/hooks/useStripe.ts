import { useMutation } from "@tanstack/react-query"
import { ApiError } from "../interfaces/error"
import { StripeService } from "../services/stripe"
import { useErrorStore } from "../Store"

export const useCreatePaymentIntent = () => {
    return useMutation<string, ApiError, string>({
        mutationFn: async (priceId) => {
            return (await StripeService.createPaymentIntent(priceId))
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}