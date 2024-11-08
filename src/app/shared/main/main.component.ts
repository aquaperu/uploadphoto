import { Component, OnInit, Signal, input } from '@angular/core';
import { ITableColumn, UiTableComponent } from '../ui-table/ui-table.component';
import { CommonModule } from '@angular/common';
import { PreviewLightboxComponent } from '../preview-lightbox/preview-lightbox.component';
import { FilePreviewModelType } from '../models/file-previewModel';



@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, UiTableComponent,PreviewLightboxComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent<TClass> {
  public lightboxFile: FilePreviewModelType;
  
  
  _data=input<TClass[]>([])
  _columns = input<ITableColumn<TClass>[]>([])

  public closeLightbox(): void {
    console.log("cerrado el ligthfile");
  }

}
