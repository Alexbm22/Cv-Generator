import { ErrorTypes, FieldError } from "../interfaces/error";

export class AppError extends Error{
    public statusCode: number;
    public field?: FieldError;
    public errType: ErrorTypes;
    public message: string;

    constructor(
        message: string,
        statusCode: number,
        errType: ErrorTypes,
        field?: FieldError
    ) {
        super(message)
        this.message = message
        this.errType = errType;
        this.statusCode = statusCode;
        this.field = field; 
    }

    static validation(message: string, param: string, formOrigin: string): AppError {
        return new AppError(message, 400, ErrorTypes.VALIDATION_ERR, {param, formOrigin});
    }

}