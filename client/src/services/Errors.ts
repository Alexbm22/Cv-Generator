import { ErrorData, ErrorTypes } from "../interfaces/error_interface";

export class AppError extends Error{
    public statusCode: number;
    public errors?: ErrorData[];
    public errType: ErrorTypes;

    constructor(
        message: string,
        statusCode: number,
        errType: ErrorTypes,
        errors?: ErrorData[]
    ) {
        super(message);
        this.errType = errType;
        this.statusCode = statusCode;
        this.errors = errors; 
    }
}