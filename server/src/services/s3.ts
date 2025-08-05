import { config } from '../config/env';
import AWS from 'aws-sdk';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { Readable } from 'stream';

export class S3Services {
    private s3Client: AWS.S3;

    constructor() {
        this.s3Client = new AWS.S3({
            credentials: {
                accessKeyId: config.AWS_ACESS_KEY_ID,
                secretAccessKey: config.AWS_SECRET_ACESS_KEY,
            },
            region: config.AWS_REGION
        });
    }

    public async uploadToS3(
        file: Express.Multer.File, 
        bucketName: string
    ) {
        try {
            const fileName = `${Date.now().toString()}.${file.mimetype.split('/')[1]}`;
    
            const params = {
                Bucket: bucketName,
                Key: fileName,
                Body: file.buffer
            }
    
            return await this.s3Client.upload(params).promise();

        } catch (error) {

            const errorMessage = error && typeof error === "object" && "message" in error ? 
                error.message : "Failed to construct event";

            throw new AppError(
                `Error uploading file: ${errorMessage}`,
                500,
                ErrorTypes.BAD_REQUEST
            )
        }
    }

    public async getFromS3(
        key: string, 
        bucketName: string
    ) {
        const params = {
            Bucket: bucketName,
            Key: key
        }

        try {
            const data = await this.s3Client.getObject(params).promise();
            if (!data.Body) {
                throw new AppError(
                    "File not found or empty",
                    500, 
                    ErrorTypes.BAD_REQUEST
                );
            }

            if (data.Body instanceof Readable) {
                return data.Body;
            }

            // Convert other types to stream
            const chunks: Uint8Array[] = [];
            for await (const chunk of data.Body as any) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);
            return Readable.from(buffer);

        } catch (error) {
            const errorMessage = error && typeof error === "object" && "message" in error ? 
                error.message : "Failed to construct event";

            throw new AppError(
                `S3 getObject error: ${errorMessage}`,
                500, 
                ErrorTypes.BAD_REQUEST
            );
        }
    }

}