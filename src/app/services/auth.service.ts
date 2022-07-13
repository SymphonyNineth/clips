import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { delay, map, Observable, of, pluck, switchMap } from 'rxjs';
import IUser from '../models/user.model';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$: Observable<boolean>;
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect: null | { authOnly: true } = null;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(map((value) => !!value));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map(() => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? null;
      });
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided!');
    }
    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    if (!userCred.user) {
      throw new Error("User can't be found");
    }
    await this.usersCollection.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    await userCred.user.updateProfile({
      displayName: userData.name,
    });
  }
  public async logOut(e: Event) {
    if (e) {
      e.preventDefault();
    }

    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
