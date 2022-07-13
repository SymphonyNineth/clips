import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AsyncValidator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  validate = async (
    control: AbstractControl
  ): Promise<ValidationErrors | null> => {
    const res = await this.auth.fetchSignInMethodsForEmail(control.value);
    return res.length ? { emailTaken: true } : null;
  };
}
