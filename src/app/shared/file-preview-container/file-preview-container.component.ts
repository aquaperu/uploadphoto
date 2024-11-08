import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { PreviewLightboxComponent } from '../preview-lightbox/preview-lightbox.component';
import { CommonModule } from '@angular/common';
import { FilePreviewModelType } from '../models/file-previewModel';
import { FilePreviewItemComponent } from '../file-preview-item/file-preview-item.component';
import { HttpErrorResponse } from '@angular/common/http';
import { FilePickerAdapter } from '../adapter/file-picker-adapter';
import { UploaderCaptions } from '../upload-captions/upload-captions';

@Component({
  selector: 'app-file-preview-container',
  standalone: true,
  imports: [CommonModule,PreviewLightboxComponent,FilePreviewItemComponent],
  templateUrl: './file-preview-container.component.html',
  styleUrl: './file-preview-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilePreviewContainerComponent {
 
  public lightboxFile: FilePreviewModelType;
  previewFiles = input<FilePreviewModelType[]>();
  
  itemTemplate = input.required<TemplateRef<any> | null>();
  enableAutoUpload = input<boolean>();
  public readonly removeFile = output <FilePreviewModelType>();
  public readonly uploadSuccess = output <FilePreviewModelType>();
  public readonly uploadFail = output <HttpErrorResponse>();
  
  adapter = input.required<FilePickerAdapter>(); 
  captions = input<UploaderCaptions>();
  
  public openLightbox(file: FilePreviewModelType): void {
    this.lightboxFile = file;
   }

  public closeLightbox(): void {
    this.lightboxFile = undefined
  }

}
