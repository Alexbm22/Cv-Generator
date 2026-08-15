import { saveAs } from 'file-saver';
import { apiService } from "./api";
import { UserCVAttributes } from "../interfaces/cv";
import { DownloadAttributes, DownloadFailureType, DownloadPreparation } from '../interfaces/downloads';
import { fetchFile } from './MediaFiles';

export class DownloadService {
    private static apiUrl = '/protected/downloads';

    static async checkDownloadRights() {
        return await apiService.get<boolean>(this.apiUrl + '/check-download-rights');
    }

    static async checkDuplicateDownload(CVId: string) {
        return await apiService.get<boolean>(this.apiUrl + `/check-duplicate`, { params: { CVId } });
    }

    static async prepareDownload(cvId: string) {
        return await apiService.post<DownloadPreparation, { cvId: string }>(
            this.apiUrl + '/prepare',
            { cvId }
        );
    }

    static async uploadPreparedPdf(putUrl: string, pdfBlob: Blob) {
        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/pdf' },
            body: pdfBlob
        });

        if (!response.ok) {
            throw new Error(`PDF upload failed with status ${response.status}.`);
        }
    }

    static async completeDownload(downloadId: string, actionId: string) {
        return await apiService.post<DownloadAttributes, { actionId: string }>(
            `${this.apiUrl}/${downloadId}/complete`,
            { actionId }
        );
    }

    static async failDownload(
        downloadId: string,
        actionId: string,
        failureType: DownloadFailureType,
        message: string
    ) {
        return await apiService.post<void, { actionId: string; failureType: DownloadFailureType; message: string }>(
            `${this.apiUrl}/${downloadId}/fail`,
            { actionId, failureType, message: message.slice(0, 2000) }
        );
    }

    static async redownloadFile(download: DownloadAttributes) {
        const downloadFile = download.downloadFile;
        if (!downloadFile.get_URL) {
            throw new Error('The completed PDF does not have a download URL.');
        }
        const downloadFileBlob = await fetchFile(downloadFile.get_URL);
        saveAs(downloadFileBlob, download.fileName);
    }

    static async getDownloads() {
        return await apiService.get<DownloadAttributes[]>(this.apiUrl);
    }

    static async deleteDownload(downloadId: string) {
        return await apiService.delete<void>(`${this.apiUrl}/${downloadId}`);
    }

    static async duplicateDownload(downloadId: string) {
        return await apiService.post<UserCVAttributes, void>(`${this.apiUrl}/duplicate/${downloadId}`);
    }

    static downloadPdf(PdfBlob: Blob, fileName: string) {
        saveAs(PdfBlob, fileName);
    }

}