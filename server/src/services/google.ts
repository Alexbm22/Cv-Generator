import { OAuth2Client } from "google-auth-library";
import { GoogleUserPayload } from '../interfaces/auth_interfaces'
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error_interface";

export class GoogleServices {
    private readonly CLIENT_ID: string;
    private OAuthClient: OAuth2Client;

    constructor() {
        this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'CLIENT_ID';
        this.OAuthClient = new OAuth2Client(this.CLIENT_ID);
    }

    async verifyGoogleToken(IdToken: string): Promise<GoogleUserPayload>{
        const ticket = await this.OAuthClient.verifyIdToken({
            idToken: IdToken,
            audience: this.CLIENT_ID
        })

        if(!ticket) {
            throw new AppError(
                'Google ticket is null', 
                400,
                ErrorTypes.INVALID_CREDENTIALS
            )
        }
        
        const payload = ticket.getPayload();

        if(!payload) {
            throw new AppError(
                'Google ticket payload is null',                
                400,
                ErrorTypes.INVALID_CREDENTIALS
            )
        }

        if(!payload.email_verified) {
            throw new AppError(
                'Google account email not verified', 
                400,
                ErrorTypes.INVALID_CREDENTIALS
            )
        }

        const {
            sub, given_name, family_name,
            picture, email, email_verified
        } = payload;
 
        return {
            google_id: sub,
            given_name,
            family_name,
            picture,
            email_verified,
            email
        } as GoogleUserPayload
    }
}