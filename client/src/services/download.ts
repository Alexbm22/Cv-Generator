import { pdf } from "@react-pdf/renderer";
import React, { createElement } from "react";
import { saveAs } from 'file-saver';
import { apiService } from "./api";
import { CVAttributes } from "../interfaces/cv";

export class DownloadService {
    private static apiUrl = '/protected/downloads';

    static async initiateDownload(CVToDownload: CVAttributes) {
        return await apiService.post<void, CVAttributes>( 
            this.apiUrl + '/initiate',
            CVToDownload
        );
    }

    static async downloadPdf(PdfDocument: React.FC<any>, fileName: string) {
        const blob = await pdf(createElement(PdfDocument)).toBlob();
        saveAs(blob, fileName);
    }

}