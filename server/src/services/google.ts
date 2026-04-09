import { OAuth2Client } from "google-auth-library";
import { GoogleUserPayload } from '@/interfaces/auth'
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { config } from "@/config/env";
import { handleServiceError } from '../utils/serviceErrorHandler';
import axios from "axios";
import { MediaFilesServices } from "./mediaFiles";
import { isValidImageUrl } from "@/utils/mediaFiles";

export class GoogleServices {
    private readonly CLIENT_ID: string;
    private OAuthClient: OAuth2Client;

    constructor() {
        this.CLIENT_ID = config.GOOGLE_CLIENT_ID;
        this.OAuthClient = new OAuth2Client(this.CLIENT_ID);
    }

    @handleServiceError('Google token verification failed')
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

    @handleServiceError('Failed to upload Google profile picture')
    async uploadGoogleProfilePicture(mediaFileId: number, imageUrl?: string): Promise<void> {
        if (!imageUrl || !isValidImageUrl(imageUrl)) {
            throw new AppError(
                'Invalid profile picture URL',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const response = await axios.get(imageUrl, { 
            responseType: 'stream',
            headers: { 'Accept': 'image/png' }
        });
        
        const contentType = 'image/png';
        
        await MediaFilesServices.uploadFile(
            mediaFileId, 
            response.data, 
            contentType
        );
    }
}