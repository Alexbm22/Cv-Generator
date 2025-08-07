import { saveAs } from 'file-saver';
import { apiService } from "./api";
import { CVAttributes } from "../interfaces/cv";
import { DownloadAttributes } from '../interfaces/downloads';

export class DownloadService {
    private static apiUrl = '/protected/downloads';

    // Sends the document data and PDF blob to the server.
    // The server verifies if the user has an active subscription or sufficient credits.
    // If verification passes, the server records the download and responds with a 204 status.
    static async createDownload(PdfBlob: Blob, documentData: CVAttributes) {
        // verify if the user has permission to download

        const filename = `${documentData.title}.pdf`;
        const file = new File([PdfBlob], filename, { 
            type: "application/pdf",
            lastModified: Date.now()
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentData', JSON.stringify(documentData));

        return await apiService.post<void, FormData>( 
            this.apiUrl + '/',
            formData,
            { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            }
        );
    }

    static async downloadFile(download_id: string, filename: string) {
        const fileBlob = await apiService.get<Blob>(
            this.apiUrl + `/${download_id}/file`,
            { responseType: 'blob' },
        )

        saveAs(fileBlob, filename);
    }

    static async getDownloads() {
        return await apiService.get<DownloadAttributes[]>(this.apiUrl);
    }

    static async downloadPdf(PdfBlob: Blob, documentData: CVAttributes) {
        saveAs(PdfBlob, documentData.title);
    }

}