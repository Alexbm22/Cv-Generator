
export abstract class BaseTokenService {
    protected abstract readonly secret?: string;
    protected abstract readonly expiration?: string;

    protected generatePayload(data: any): any {
        return {
            ...data,
            timestamp: Date.now(),
        };
    }

    protected isExpired(timestamp: number, maxAge: number): boolean {
        return (Date.now() - timestamp) > maxAge;
    }

    abstract generateToken(...args: any[]): any;
    abstract decodeToken(token: string, ...args: any[]): any;
    abstract verifyToken(token: string, ...args: any[]): boolean;
}