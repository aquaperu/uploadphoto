import {ChangeDetectionStrategy, Component, OnInit, TemplateRef, inject, model, signal} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PreviewLightboxComponent } from '../preview-lightbox/preview-lightbox.component';
import { FilePreviewModelType } from '../models/file-previewModel';

export interface IDynamicDialogConfig  extends DialogData{
  title?: string;
  acceptButtonTitle?: string;
  declineButtonTitle?: string;
  dialogContent: TemplateRef<any>;
  matdialogcontent_height:string;
  matdialogcontent_width:string;
  callbackMethod?: () => void;
}

export interface DialogData  {
  animal: string;
  name: string;
  peso:number;
}
@Component({
  selector: 'app-ui-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    PreviewLightboxComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ui-dialog.component.html',
  styleUrl: './ui-dialog.component.css'
})
export class UiDialogComponent {
  

  readonly dialogRef = inject(MatDialogRef<UiDialogComponent>);
  readonly data = inject<IDynamicDialogConfig>(MAT_DIALOG_DATA);
  
  

  onNoClick(): void {

    this.dialogRef.close();
  }
  
  

}
