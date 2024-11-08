import { Observable } from 'rxjs';
import { FilePreviewModelType } from '../models/file-previewModel';

export interface IUploadResponse {
    body?: any;
    status: EUploadStatus;
    progress?: number;
} 

export enum EUploadStatus {
   UPLOADED = 'UPLOADED',
   IN_PROGRESS = 'IN PROGRESS',
   ERROR = 'ERROR'
}

export abstract class FilePickerAdapter {
 public abstract uploadFile(fileItem: FilePreviewModelType): Observable<IUploadResponse | undefined>;
 public abstract removeFile(fileItem: FilePreviewModelType): Observable<any>;
}