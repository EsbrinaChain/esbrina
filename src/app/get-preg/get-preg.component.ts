import { Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-get-preg',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatDialogContent, MatDialogActions, MatFormFieldModule,
    MatButtonModule, MatDialogModule, MatInputModule,MatDialogClose],
  templateUrl: './get-preg.component.html',
  styleUrl: './get-preg.component.scss'
})
export class GetPregComponent {

  dataPreg: any;

  constructor(
    private dialog: MatDialogRef<GetPregComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataPreg = data;
  }

  cancelado() {
    this.dialog.close();
  }

  confirmado() {
    this.dialog.close(this.dataPreg);
  }

}
