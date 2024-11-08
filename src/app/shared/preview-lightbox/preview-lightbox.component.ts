import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FilePreviewModelType } from '../models/file-previewModel';
import { CloseIconComponent } from '../close-icon/close-icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'preview-lightbox',
  standalone: true,
  imports: [CommonModule, CloseIconComponent],
  templateUrl: './preview-lightbox.component.html',
  styleUrl: './preview-lightbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewLightboxComponent  implements OnInit {
  
  fileInputSignal = input<FilePreviewModelType>()
  previewCloseOutputSignal = output<void>()
  loaded: boolean;
  safeUrl: SafeResourceUrl;

  private sanitizer = inject(DomSanitizer)
  
  ngOnInit(): void {
    this.getSafeUrl(this.fileInputSignal()!.file);
  }
  public getSafeUrl(file: File | Blob): void {
    const url = window.URL.createObjectURL(file);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  
  public onClose(event:any): void {
    this.previewCloseOutputSignal.emit(event);
   }

}
