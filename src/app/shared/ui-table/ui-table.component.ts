import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnChanges, SimpleChanges, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { map } from 'rxjs';


type TableConfigType = string | null | undefined | number

export interface ITableColumn<TConfig> {
  label:string;
  def:string ;
  content:(row: TConfig)=>TableConfigType
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './ui-table.component.html',
  styleUrl: './ui-table.component.css'
})
export class UiTableComponent<TClass> implements OnChanges {
  
  dataSource = new MatTableDataSource<TClass>([]);
  data=input<TClass[]>([])
  columns = input<ITableColumn<TClass>[]>([])
  displayedColumns = computed(()=>this.columns().map(nombreColumna => nombreColumna.def))

  //responsive
  private breakpointObserver = inject(BreakpointObserver)
  private isMobile$ = this.breakpointObserver
  .observe(Breakpoints.Handset).pipe(map(result => result.matches))
  isMobile = toSignal(this.isMobile$,{initialValue:false})

  ngOnChanges(changes: SimpleChanges): void {
    
    if(changes['data'].currentValue){
      this.setdata()

    }
    
  }
  private setdata(){
    this.dataSource.data = this.data()

  }
  
}
