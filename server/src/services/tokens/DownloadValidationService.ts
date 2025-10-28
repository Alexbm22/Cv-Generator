import { PublicCVAttributes } from "@/interfaces/cv";
import { BaseTokenService } from "./BaseTokenService";


export class DownloadValidationTokenService extends BaseTokenService {
    protected readonly secret = undefined;
    protected readonly expiration = undefined;
    private readonly maxAge = 5 * 60 * 1000; 

    encodeToken(payload: any): string {
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    decodeToken(token: string): any | null {
        try {
            return JSON.parse(Buffer.from(token, 'base64').toString());
        } catch {
            return null;
        }
    }

    generateToken(userId: number, cvAttributes: PublicCVAttributes): string {
        const payload = this.generatePayload({
            userId,
            cvId: cvAttributes.id,
            hash: this.createAttributesHash(cvAttributes)
        });
        
        return this.encodeToken(payload);
    }

    verifyToken(token: string, userId: number, cvAttributes: PublicCVAttributes): boolean {
        const payload = this.decodeToken(token);
        if (!payload) return false;

        return (
            payload.userId === userId &&
            payload.cvId === cvAttributes.id &&
            !this.isExpired(payload.timestamp, this.maxAge) &&
            payload.hash === this.createAttributesHash(cvAttributes)
        );
    }

    private createAttributesHash(cvAttributes: PublicCVAttributes): string {
        const { updatedAt, preview, photo, ...essentialAttributes } = cvAttributes;
        return Buffer.from(JSON.stringify(essentialAttributes)).toString('base64');
    }
}