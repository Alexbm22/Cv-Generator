import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";

// Class method decorator version
export function handleServiceError(errorMessage: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error) {
                console.error(`Error in service method: ${errorMessage}`, error);
                if (error instanceof AppError) {
                    throw error;
                } else {
                    throw new AppError(
                        errorMessage,
                        500,
                        ErrorTypes.INTERNAL_ERR,
                        error
                    );
                }
            }
        };

        return descriptor;
    };
}