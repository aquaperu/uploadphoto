import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, inject, input, output } from '@angular/core';
import { FilePreviewModelType } from '../models/file-previewModel';
import { EUploadStatus, FilePickerAdapter, IUploadResponse } from '../adapter/file-picker-adapter';
import { Subscription, mergeMap } from 'rxjs';
import { SafeResourceUrl } from '@angular/platform-browser';
import { toObservable } from '@angular/core/rxjs-interop';
import { GET_FILE_TYPE, IS_IMAGE_FILE } from '../utils/utilidades';
import { RefreshIconComponent } from '../refresh-icon/refresh-icon.component';
import { CloseIconComponent } from '../close-icon/close-icon.component';
import { UploaderCaptions } from '../upload-captions/upload-captions';
import { FilePickerService } from '../services/file-picker.service';

@Component({
  selector: 'app-file-preview-item',
  standalone: true,
  imports: [CommonModule,RefreshIconComponent,CloseIconComponent],
  templateUrl: './file-preview-item.component.html',
  styleUrl: './file-preview-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilePreviewItemComponent implements OnInit {
  @Output() public readonly removeFile = new EventEmitter<FilePreviewModelType>();
  @Output() public readonly uploadSuccess = new EventEmitter<FilePreviewModelType>();
  @Output() public readonly uploadFail = new EventEmitter<HttpErrorResponse>();
  @Output() public readonly imageClicked = new EventEmitter<FilePreviewModelType>();
  @Input() public fileItem: FilePreviewModelType;
  @Input() adapter: FilePickerAdapter;
  @Input() itemTemplate: TemplateRef<any>;
  @Input() captions: UploaderCaptions;
  @Input() enableAutoUpload: boolean;
  public uploadProgress: number;
  public isImageFile: boolean;
  public fileType: string;
  public safeUrl: SafeResourceUrl;
  public uploadError: boolean;
  public uploadResponse: any;
  private _uploadSubscription: Subscription;
  constructor(
    private fileService: FilePickerService,
    private changeRef: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    if (this.fileItem?.file) {
      this._uploadFile(this.fileItem);
      this.safeUrl = this.getSafeUrl(this.fileItem.file);
    }
    this.fileType = GET_FILE_TYPE(this.fileItem!.fileName);
    this.isImageFile = IS_IMAGE_FILE(this.fileType);
  }

  public getSafeUrl(file: File | Blob): SafeResourceUrl {
    return this.fileService.createSafeUrl(file);
  }
  /** Converts bytes to nice size */
  public niceBytes(x:any): string {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0;
    let n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    // include a decimal point and a tenths-place digit if presenting
    // less than ten of KB or greater units
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
  }
  /** Retry file upload when upload was unsuccessfull */
  public onRetry(): void {
    this.uploadError = false;
    this._uploadFile(this.fileItem);
  }

  public onRemove(fileItem: FilePreviewModelType): void {
    this._uploadUnsubscribe();
    this.removeFile.emit({
      ...fileItem!,
      uploadResponse: this.uploadResponse || fileItem!.uploadResponse
    });
   }

  private _uploadFile(fileItem: FilePreviewModelType): void {
    if (!this.enableAutoUpload) {
      return;
    }
    if (this.adapter) {
      this._uploadSubscription =
      this.adapter.uploadFile(fileItem)
      .subscribe((res) => {
        if (res && res.status === EUploadStatus.UPLOADED) {
          this._onUploadSuccess(res.body, fileItem);
          this.uploadProgress =Number(undefined) ;
        }
        if (res && res.status === EUploadStatus.IN_PROGRESS) {
          this.uploadProgress = Number(res.progress);
          this.changeRef.detectChanges();
        }
        if (res && res.status === EUploadStatus.ERROR) {
          this.uploadError = true;
          this.uploadFail.emit(res.body);
          this.uploadProgress = Number(undefined);
        }
        this.changeRef.detectChanges();
      }, (er: HttpErrorResponse) => {
        this.uploadError = true;
        this.uploadFail.emit(er);
        this.uploadProgress = Number(undefined);
        this.changeRef.detectChanges();
  });
    } else {
      console.warn('no adapter was provided');
    }
  }
  /** Emits event when file upload api returns success  */
  private _onUploadSuccess(uploadResponse: any, fileItem: FilePreviewModelType): void {
    this.uploadResponse = uploadResponse;
    this.fileItem!.uploadResponse = uploadResponse;
    this.uploadSuccess.emit({...fileItem!, uploadResponse});
  }

 /** Cancel upload. Cancels request  */
 private _uploadUnsubscribe(): void {
  if (this._uploadSubscription) {
    this._uploadSubscription.unsubscribe();
   }
 }
}
