import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter, inject, Injector,
  Input,
  output,
  OnDestroy,
  OnInit,
  runInInjectionContext,
  TemplateRef

} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { bufferCount, combineLatest, Observable, of, Subject, switchMap} from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { lookup } from 'mrmime';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FilePreviewModelType } from '../models/file-previewModel';
import { FileValidationTypes, ValidationError } from '../models/validation-error';
import { FilePickerAdapter } from '../adapter/file-picker-adapter';
import { UploaderCaptions } from '../upload-captions/upload-captions';
import { DefaultCaptions } from '../upload-captions/default-captions';
import { FileValidatorService } from '../services/file-validator.service';
import { DEFAULT_CROPPER_OPTIONS, GET_FILE_CATEGORY_TYPE } from '../utils/utilidades';
import { FilePickerService } from '../services/file-picker.service';
import { UploadEvent } from '../models/upload-event-model';
import { CommonModule } from '@angular/common';
import { FiledropComponent } from '../filedrop/filedrop.component';
import { FilePreviewContainerComponent } from '../file-preview-container/file-preview-container.component';


@Component({
  selector: 'app-filepicker',
  standalone: true,
  imports: [CommonModule,FiledropComponent,FilePreviewContainerComponent],
  templateUrl: './filepicker.component.html',
  styleUrl: './filepicker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilepickerComponent implements OnDestroy{
 /** Emitted when file upload via api successfully. Emitted for every file */
 readonly uploadSuccess = output<FilePreviewModelType>();
 /** Emitted when file upload via api failed. Emitted for every file */
 readonly uploadFail = output<HttpErrorResponse>();
 /** Emitted when file is removed via api successfully. Emitted for every file */
 readonly removeSuccess = output<FilePreviewModelType>();
 /** Emitted on file validation fail */
 readonly validationError = output<ValidationError>();
 /** Emitted when file is added and passed validations. Not uploaded yet */
 readonly fileAdded = output<FilePreviewModelType>();
 /** Emitted when file is removed from fileList */
 readonly fileRemoved = output<FilePreviewModelType>();
 /** Custom validator function */
 @Input() customValidator : ((file: File) => Observable<boolean>);
 /** Whether to enable cropper. Default: disabled */
 @Input() enableCropper = false;
 /** Whether to show default drag and drop zone. Default:true */
 @Input() showeDragDropZone = true;
 /** Whether to show default files preview container. Default: true */
 @Input() showPreviewContainer = true;
 /** Preview Item template */
 @Input() itemTemplate: TemplateRef<any> | null;
 /** Single or multiple. Default: multi */
 @Input() uploadType = 'multi';
 /** Max size of selected file in MB. Default: no limit */
 @Input() fileMaxSize: number;
 /** Max count of file in multi-upload. Default: no limit */
 @Input() fileMaxCount: number;
 /** Total Max size limit of all files in MB. Default: no limit */
 @Input() totalMaxSize: number;
 /** Which file types to show on choose file dialog. Default: show all */
 @Input() accept: string;
 /** File extensions filter */
 @Input() fileExtensions: string[];
 /** Cropper options. */
 @Input() cropperOptions: object;
 /** Cropped canvas options. */
 @Input() croppedCanvasOptions: object = {};
 /** Custom api Adapter for uploading/removing files */
 @Input() adapter: FilePickerAdapter;
 /**  Custome template for dropzone */
 @Input() dropzoneTemplate: TemplateRef<any>;
 /** Custom captions input. Used for multi language support */
 @Input() captions: UploaderCaptions = DefaultCaptions;
 /** captions object */
 /** Whether to auto upload file on file choose or not. Default: true */
 @Input() enableAutoUpload = true;

 /** capture paramerter for file input such as user,environment*/
 @Input() fileInputCapture: string;

 cropper: any;
 public files: FilePreviewModelType[] = [];
 /** Files array for cropper. Will be shown equentially if crop enabled */
 filesForCropper: File[] = [];
 /** Current file to be shown in cropper */
 public currentCropperFile: File | undefined; 
 public safeCropImgUrl: SafeResourceUrl;
 public isCroppingBusy: boolean;

 private _cropClosed$ = new Subject<FilePreviewModelType>();
 private _onDestroy$ = new Subject<void>();
 private readonly injector = inject(Injector);

 constructor(
   private readonly fileService: FilePickerService,
   private readonly fileValidatorService: FileValidatorService,
   private readonly changeRef: ChangeDetectorRef
 ) {}

 

 public ngOnDestroy(): void {
   this._onDestroy$.next();
   this._onDestroy$.complete();
 }

 /** On input file selected */
 // TODO: fix any
 public onChange(event: any): void {
   const files: File[] = Array.from(event);
   this.handleFiles(files).subscribe();
 }

 /** On file dropped */
 public dropped(event: UploadEvent): void {
   const files = event.files;
   const filesForUpload: Subject<File> = new Subject();
   let droppedFilesCount = 0;
   for (const droppedFile of files) {
     // Is it a file?
     if (droppedFile.fileEntry.isFile) {
       droppedFilesCount += 1;
       const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
       fileEntry.file((file: File) => {
         filesForUpload.next(file);
       });
     } else {
       // It was a directory (empty directories are added, otherwise only files)
       const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
       // console.log(droppedFile.relativePath, fileEntry);
     }
   }
   runInInjectionContext((this.injector), () => {
     filesForUpload.pipe(
       takeUntilDestroyed(),
       bufferCount(droppedFilesCount),
       switchMap(filesForUpload => this.handleFiles(filesForUpload))
     ).subscribe();
   });
 }

 /** Emits event when file upload api returns success  */
 public onUploadSuccess(fileItem: FilePreviewModelType): void {
   this.uploadSuccess.emit(fileItem);
 }

 /** Emits event when file upload api returns success  */
 public onUploadFail(er: HttpErrorResponse): void {
   this.uploadFail.emit(er);
 }

 /** Emits event when file remove api returns success  */
 public onRemoveSuccess(fileItem: FilePreviewModelType): void {
   this.removeSuccess.emit(fileItem);
   this.removeFileFromList(fileItem);
 }

 //public getSafeUrl(file: File): SafeResourceUrl {
 //  return this.fileService.createSafeUrl(file);
 //}

 /** Removes file from UI and sends api */
 public removeFile(fileItem: FilePreviewModelType): void {
   if (!this.enableAutoUpload) {
     this.removeFileFromList(fileItem);
     return;
   }
   if (this.adapter) {
     this.adapter.removeFile(fileItem).subscribe((res:any) => {
       this.onRemoveSuccess(fileItem);
     });
   } else {
     console.warn('no adapter was provided');
   }
 }

 /** Handles input and drag/drop files */
 handleFiles(files: File[]): Observable<void | null> {
   
   const isValidUploadSync = files.every(item => this._validateFileSync(item));
   const asyncFunctions = files.map(item => this._validateFileAsync(item));
   return combineLatest([...asyncFunctions]).pipe(
     map(res => {
       const isValidUploadAsync = res.every(result => result === true);
       if (!isValidUploadSync || !isValidUploadAsync) {
         return;
       }
       files.forEach((file: File, index: number) => {
         this.handleInputFile(file, index);
       });
     })
   );
 }

 /** Validates synchronous validations */
 private _validateFileSync(file: File): boolean {
   if (!file) {
     return false;
   }
   if (!this.isValidUploadType(file)) {
     return false;
   }
   if (!this.isValidExtension(file, file.name)) {
     return false;
   }
   return true;
 }

 /** Validates asynchronous validations */
 private _validateFileAsync(file: File): Observable<boolean> {
   if (!this.customValidator) {
     return of(true);
   }
     
   return this.customValidator(file).pipe(
     tap(res => {
       if (!res) {
         this.validationError.emit({
           file,
           error: FileValidationTypes.customValidator
         });
       }
     })
   );
 }

 /** Handles input and drag&drop files */
 handleInputFile(file: File, index:any): void {
   const type = GET_FILE_CATEGORY_TYPE(file.type);
   if (type === 'image') {
    if (this.isValidSize(file, file.size)) {
      this.pushFile(file);
    }

   } 
 }

 /** Validates if upload type is single so another file cannot be added */
 private isValidUploadType(file:any): boolean {
   const isValid = this.fileValidatorService.isValidUploadType(this.files, this.uploadType);

   if (!isValid) {
     this.validationError.emit({
       file,
       error: FileValidationTypes.uploadType
     });
     return false;
   };

   return true;
 }



 /** Add file to file list after succesfull validation */
 pushFile(file: File, fileName = file.name): void {
   const newFile = { file, fileName };
   const files = [...this.files, newFile];
   this.setFiles(files);
   this.fileAdded.emit({ file, fileName });
   this.changeRef.detectChanges();
 }

 /** @description Set files for uploader */
 public setFiles(files: FilePreviewModelType[]): void {
   this.files = files;
   this.changeRef.detectChanges();
 }

  /** Removes files from files list */
 removeFileFromList(file: FilePreviewModelType): void {
   const files = this.files.filter(f => f?.fileName !== file?.fileName);
   this.setFiles(files);
   this.fileRemoved.emit(file);
   this.changeRef.detectChanges();
 }

 /** Validates file extension */
 private isValidExtension(file: File, fileName: string): boolean {
   const isValid = this.fileValidatorService.isValidExtension(fileName, this.fileExtensions);
   if (!isValid) {
     this.validationError.emit({file, error: FileValidationTypes.extensions});
     return false;
   }
   return true;
 }

 /** Validates selected file size and total file size */
 private isValidSize(newFile: File, newFileSize: number): boolean {
   /** Validating selected file size */
   const isValidFileSize: boolean = this.fileValidatorService.isValidFileSize(newFileSize, this.fileMaxSize);
   const isValidTotalFileSize: boolean = this.fileValidatorService.isValidTotalFileSize(newFile, this.files, this.totalMaxSize);

   if (!isValidFileSize) {
     this.validationError.emit({
       file: newFile,
       error: FileValidationTypes.fileMaxSize
     });
   }

   /** Validating Total Files Size */
   if (!isValidTotalFileSize) {
     this.validationError.emit({
       file: newFile,
       error: FileValidationTypes.totalMaxSize
     });
   };

   return isValidFileSize && isValidTotalFileSize;
 }



  

}
