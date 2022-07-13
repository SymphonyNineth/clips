import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

import { RegisterValidators } from 'src/app/validators/register-validators';
import { EmailTaken } from 'src/app/validators/email-taken';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  inSubmission = false;
  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(13),
    Validators.max(225),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  ]);
  confirmPassword = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(17),
    Validators.maxLength(17),
  ]);
  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.match('password', 'confirmPassword')]
  );
  showAlert = false;
  alertMsg = 'Please wait! Your account is being created';
  alertColor: 'red' | 'green' | 'blue' = 'blue';

  private showStatus() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created';
    this.alertColor = 'blue';
  }
  async register() {
    this.inSubmission = true;
    this.showStatus();
    try {
      await this.auth.createUser(this.registerForm.value as IUser);
      this.alertMsg = 'Your account has been created';
      this.alertColor = 'green';
    } catch (e) {
      this.alertMsg = 'An error occured, try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.inSubmission = false;
  }
}
