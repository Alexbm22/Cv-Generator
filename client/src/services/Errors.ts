import { ErrorTypes } from "../interfaces/error_interface";

export class AppError extends Error{
    public statusCode: number;
    public field?: string;
    public errType: ErrorTypes;
    public message: string;

    constructor(
        message: string,
        statusCode: number,
        errType: ErrorTypes,
        field?: string
    ) {
        super(message)
        this.message = message
        this.errType = errType;
        this.statusCode = statusCode;
        this.field = field; 
    }

    static validation(message: string, field: string): AppError {
        return new AppError(message, 400, ErrorTypes.VALIDATION_ERR, field);
    }

}