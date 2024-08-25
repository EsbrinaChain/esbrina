import { Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-prestigio',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatDialogContent, MatDialogActions, MatFormFieldModule,
    MatButtonModule, MatDialogModule, MatInputModule,MatDialogClose],
  templateUrl: './prestigio.component.html',
  styleUrl: './prestigio.component.scss'
})
export class PrestigioComponent {

  data_user: any;
    constructor(
    private dialog: MatDialogRef<PrestigioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.data_user = data;
  }

confirmado() {
  this.dialog.close(this.data_user);
}

}
