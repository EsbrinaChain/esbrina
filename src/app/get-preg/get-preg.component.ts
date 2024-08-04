import { Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-get-preg',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './get-preg.component.html',
  styleUrl: './get-preg.component.scss'
})
export class GetPregComponent {

  emailIncorrecte = false;
  pregForm: any;

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialogRef<GetPregComponent>) {
    this.dialog.updateSize("50%", "37%");
    this.pregForm = formBuilder.group({
      enunciado:"",
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      recompensa: ""
    });
    
  }

  testEmail() {
    if (this.pregForm.status == "INVALID") {
      this.emailIncorrecte = true;
    }
    else {
      this.emailIncorrecte = false;
    }
  }

  sendPreg(sendData: any) {
    this.dialog.close();
    console.log("enunciado:", sendData.enunciado);
    console.log("Recompensa: ", sendData.recompensa);
    
  }


}
