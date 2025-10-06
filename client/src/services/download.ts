import { saveAs } from 'file-saver';
import { apiService } from "./api";
import { UserCVAttributes } from "../interfaces/cv";
import { DownloadAttributes, DownloadValidationResult } from '../interfaces/downloads';

export class DownloadService {
    private static apiUrl = '/protected/downloads';

    // Sends the document data and PDF blob to the server.
    // The server verifies if the user has an active subscription or sufficient credits.
    // If verification passes, the server records the download and responds with a 204 status.
    static async executeDownload(PdfBlob: Blob, documentData: UserCVAttributes, validationToken: string) {
        // verify if the user has permission to download

        const filename = `${documentData.title}.pdf`;
        const file = new File([PdfBlob], filename, { 
            type: "application/pdf",
            lastModified: Date.now()
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentData', JSON.stringify(documentData));
        formData.append('validationToken', validationToken);

        return await apiService.post<DownloadAttributes, FormData>( 
            this.apiUrl + '/',
            formData,
            { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            }
        );
    }

    static async validateDownload(documentData: UserCVAttributes) {
        return await apiService.post<DownloadValidationResult, UserCVAttributes>(
            this.apiUrl + '/validate',
            documentData
        );
    }

    static async getDownloads() {
        return await apiService.get<DownloadAttributes[]>(this.apiUrl);
    }

    static downloadPdf(PdfBlob: Blob, fileName: string) {
        saveAs(PdfBlob, fileName);
    }

}