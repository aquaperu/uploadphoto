import { Component, OnInit, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialogoutlet',
  standalone: true,
  imports: [ MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,],
  templateUrl: './dialogoutlet.component.html',
  styleUrl: './dialogoutlet.component.css'
})
export class DialogoutletComponent  {
  animalModelHijo = model('')
  cambiarPesoHijo = input<string>('')
}
