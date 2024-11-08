import { Component, Input, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ITableColumn, UiTableComponent } from "./shared/ui-table/ui-table.component";
import { MainComponent } from './shared/main/main.component';
import { CommonModule } from '@angular/common';
import { Observable, delay, of } from 'rxjs';
import { FilepickerComponent } from './shared/filepicker/filepicker.component';
import { FilePreviewModelType } from './shared/models/file-previewModel';
import { UploaderCaptions } from './shared/upload-captions/upload-captions';
import { DemoFilePickerAdapter } from './image.adaptador';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ValidationError } from './shared/models/validation-error';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

type objGeneric = {[keys:string]:any} 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainComponent,FilepickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  customValidator : ((File:string)=>Observable<boolean>) ; 
  customers:PeriodicElement[] = ELEMENT_DATA;
  tableColumns:ITableColumn<PeriodicElement>[] = [
    {
      label:"Nombre",
      def:"name",
      content:(row)=>row.name
    },
    {
      label:"posisión",
      def:"position",
      content:(row)=> row.position
    },
    {
      label:"Peso",
      def:"weight",
      content:(row)=>row.weight
    },
    {
      label:"Simbolo",
      def:"symbol",
      content:(row)=> row.symbol
    }
  ]

  @ViewChild('uploader', { static: true }) uploader: FilepickerComponent;
  public adapter = new DemoFilePickerAdapter(this.http);
  public myFiles: FilePreviewModelType[] = [];
  public captions: UploaderCaptions = {
    dropzone: {
      title: 'Fayllari bura ata bilersiz',
      or: 'və yaxud',
      browse: 'Fayl seçin'
    },
    cropper: {
      crop: 'Kəs',
      cancel: 'Imtina'
    },
    previewCard: {
      remove: 'Sil',
      uploadError: 'Fayl yüklənmədi'
    }
  };

  constructor(private http: HttpClient) {
    //this.adapter = new DemoFilePickerAdapter(this.http);
   }

  public ngOnInit(): void {
    setTimeout(() => {
      const files = [
        {
          fileName: 'My File 1 for edit.png', file: null as any
        },
        {
          fileName: 'My File 2 for edit.xlsx', file: null as any
        }
      ] as FilePreviewModelType[];
    //  this.uploader.setFiles(files);
    }, 1000);
  }

  public onValidationError(er: ValidationError): void {
    console.log('validationError', er);
  }

  public onUploadSuccess(res: FilePreviewModelType): void {
    console.log('uploadSuccess', res);
  // console.log(this.myFiles)
  }

  public onUploadFail(er: HttpErrorResponse): void {
    console.log('uploadFail', er);
  }

  public onRemoveSuccess(res: FilePreviewModelType): void {
    console.log('removeSuccess', res);
  }

  public onFileAdded(file: FilePreviewModelType): void {
    console.log('fileAdded', file);
    this.myFiles.push(file);
  }

  public onFileRemoved(file: FilePreviewModelType): void {
    console.log('fileRemoved', this.uploader.files);
  }

  public removeFile(): void {
    this.uploader.removeFileFromList(this.myFiles[0]);
  }

  public myCustomValidator(file: File): Observable<boolean> {
    if (!file.name.includes('uploader')) {
        return of(true).pipe(delay(100));
    }
    return of(false).pipe(delay(100));
}

public clearAllFiles(): void {
  this.uploader.files = [];
}

public onRemoveFile(fileItem: FilePreviewModelType): void {
  this.uploader.removeFile(fileItem);
}
  
}
