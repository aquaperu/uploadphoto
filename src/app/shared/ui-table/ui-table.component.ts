import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnChanges, OnInit, Signal, SimpleChanges, TemplateRef, computed, effect, inject, input, model, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { map } from 'rxjs';
import {signal} from '@angular/core'
import { MatDialog } from '@angular/material/dialog';
import { UiDialogComponent } from '../ui-dialog/ui-dialog.component';
import { FormRecord } from '@angular/forms';
import { PeriodicElement } from '../../app.component';
import { DialogoutletComponent } from '../dialogoutlet/dialogoutlet.component';


type TableConfigType = string | null | undefined | number

export interface ITableColumn<TConfig> {
  label:string;
  def:string ;
  content:(row: TConfig)=>TableConfigType
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, MatTableModule,DialogoutletComponent],
  templateUrl: './ui-table.component.html',
  styleUrl: './ui-table.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush//necesario para no generar error al momento de cambiar de columnas
})
export class UiTableComponent<TClass> implements OnChanges {
 

  readonly animal = signal('');
  readonly name = model('');
  readonly dialog = inject(MatDialog);
  animailSignalPadre = signal<any>('')


  displayedColumns = computed(()=>this.columns().map(nombreColumna => nombreColumna.def))
  dataSource = new MatTableDataSource<TClass>([]);
  data=input<TClass[]>([])
  columns = input<ITableColumn<TClass>[]>([])
  cambiarPesoPadre:string = 'hola'



  //viewChild('warningDialog')  warningDialog: TemplateRef<any> | undefined;
  warningDialog = viewChild<TemplateRef<any> | undefined>('warningDialog') 
  
  
  //inicio responsive
  private breakpointObserver = inject(BreakpointObserver)
  private isMobile$ = this.breakpointObserver
  .observe(Breakpoints.Handset)
  .pipe(map((result) => {
   
    return result.matches 
  }))
  isMobile = toSignal(this.isMobile$,{initialValue:false})
  //fin responsive

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['data'].currentValue){
      this.setdata()
    }
    
  }
  private setdata(){
    this.dataSource.data = this.data()

  }
  
  openDialog(row:any): void {
   this.cambiarPesoPadre = row.weight
    this.name.set(row.name)
    const dialogRef = this.dialog.open(UiDialogComponent, {
      
      data:{ 
        title: row.name,
        peso:row.weight,
        //por medio del atributo dialog content el componente DialogsinoComponent renderizara el contenido 
        dialogContent: this.warningDialog(), },
    });
    this.animailSignalPadre.set(row.weight)

    dialogRef.afterClosed().subscribe(result => {
     console.log('The dialog was closed');
     
     

      if (this.noChange(row.weight,this.animailSignalPadre())) {
        let actualiza = computed(()=>this.data().filter((ele:any)=>ele.position === row.position).map((val:any)=>val.weight = result))
        console.log(actualiza())
     
        
      }
    });
  }
  rowSelected(row:any){
  
    
    this.openDialog(row)

  }

  private actualizaPropiedad(criterio:any,actualiza:any){
    return criterio.weight = actualiza
  }
  private filtraTablaPropiedad(ele:any,position:any){
    return ele.position === position
  
  }
  private noChange(previousValue:any,actualValue:any){
    if(previousValue === actualValue){
      console.log("no ubo cambios")
      return true
    }else{
      console.log("si ubo cambios")
      return false
    }

  }
  
}
