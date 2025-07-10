import { useMutation } from "@tanstack/react-query"
import { ApiError } from "../interfaces/error_interface"
import { StripeService } from "../services/stripe"
import { useErrorStore } from "../Store"

export const useCreatePaymentIntent = () => {
    return useMutation<string, ApiError, string>({
        mutationFn: async (priceId) => {
            return (await StripeService.createPaymentIntent(priceId)).data!
        },
        onError: (error) => {
            useErrorStore.getState().creeateError(error);
        }
    })
}