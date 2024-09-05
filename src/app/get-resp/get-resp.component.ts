import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-get-resp',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatDialogContent, MatDialogActions, MatFormFieldModule,
    MatButtonModule, MatDialogModule, MatInputModule,MatDialogClose],
  templateUrl: './get-resp.component.html',
  styleUrl: './get-resp.component.scss'
})
export class GetRespComponent {

  nuevaResp = {
    enunciado: ''
  };


  constructor(
    private dialog: MatDialogRef<GetRespComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.nuevaResp = data;
  }

canceladoResp() {
    this.dialog.close();
  }

  confirmadoResp() {
    this.dialog.close(this.nuevaResp);
  }
}


