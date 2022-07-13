import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };
  alertMsg: string | null = null;
  alertColor: 'red' | 'green' | 'blue' = 'blue';

  constructor(public auth: AngularFireAuth) {}

  async login() {
    try {
      this.alertMsg = 'You are being logged in';
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
      this.alertColor = 'green';
      this.alertMsg = 'You have been successfully logged in';
    } catch (err) {
      this.alertColor = 'red';
      this.alertMsg =
        'An error occured, check login and password or try again later';
    }
  }
}
