import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";

type ServiceMethod<T> = (...args: any[]) => Promise<T>;

export function withErrorHandler<T>(
    method: ServiceMethod<T>,
    errorMessage: string
): ServiceMethod<T> {
    return async (...args: any[]): Promise<T> => {
        try {
            return await method(...args);
        } catch (error) {
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
}

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