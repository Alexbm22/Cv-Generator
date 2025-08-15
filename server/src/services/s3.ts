import { config } from '../config/env';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { Readable } from 'stream';

export class S3Service {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            credentials: {
                accessKeyId: config.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
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

            const command = new PutObjectCommand(params);
    
            await this.s3Client.send(command);

            return fileName

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

            const command = new GetObjectCommand(params);
            const data = await this.s3Client.send(command);
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

            if (Buffer.isBuffer(data.Body)) {
                return Readable.from(data.Body);
            }

            if (typeof data.Body === "string") {
                return Readable.from(Buffer.from(data.Body));
            }

            // Convert other types to stream
            const chunks: Uint8Array[] = [];
            for await (const chunk of data.Body as AsyncIterable<Uint8Array>) {
                if (!(chunk instanceof Uint8Array)) {
                    throw new Error("Unexpected chunk type");
                }
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

    public async generatePresignedGetUrl(
        key: string,
        bucketName: string,
        expiresIn: number = 5 * 60 * 1000
    ) {
        try {
            const params = {
                Bucket: bucketName,
                Key: key
            };

            const command = new GetObjectCommand(params);

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });
            const expiresAt = new Date(Date.now() + expiresIn).getTime();

            return {
                url,
                expiresAt
            }
        } catch (error) {
            const errorMessage = error && typeof error === "object" && "message" in error ?
                error.message : "Failed to generate presigned URL";

            throw new AppError(
                `S3 getPresignedUrl error: ${errorMessage}`,
                500,
                ErrorTypes.BAD_REQUEST
            );
        }
    }

    public async generatePresignedPutUrl(
        key: string,
        bucketName: string,
        expiresIn: number = 5 * 60 * 1000
    ) {
        try {
            const params = {
                Bucket: bucketName,
                Key: key
            };

            const command = new PutObjectCommand(params);

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });
            const expiresAt = new Date(Date.now() + expiresIn).getTime();

            return {
                url,
                expiresAt
            }
        } catch (error) {
            const errorMessage = error && typeof error === "object" && "message" in error ?
                error.message : "Failed to generate presigned URL";

            throw new AppError(
                `S3 getPresignedUrl error: ${errorMessage}`,
                500,
                ErrorTypes.BAD_REQUEST
            );
        }
    }

}