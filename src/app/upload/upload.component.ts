import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { combineLatest, switchMap, forkJoin } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from '../services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from '../services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  screenshotTask?: AngularFireUploadTask;
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  selectedScreenshot = '';
  screenshots: string[] = [];

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({ title: this.title });

  showAlert = false;
  alertColor: 'red' | 'green' | 'blue' = 'blue';
  alertMsg = 'Please wait, your clip is being uploaded';
  inSubmission = false;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  async storeFile(e: Event) {
    if (this.ffmpegService.isRunning) return;
    this.isDragover = false;
    if ('dataTransfer' in e) {
      this.file = (e as DragEvent).dataTransfer?.files[0] ?? null;
    } else {
      this.file = (e.target as HTMLInputElement)?.files![0] ?? null;
    }
    if (!this.file || this.file.type !== 'video/mp4') return;
    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  selectScreenshot(screenshot: string) {
    this.selectedScreenshot = screenshot;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait, your clip is being uploaded';
    this.inSubmission = true;

    this.showPercentage = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    const screenshot = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;
    this.screenshotTask = this.storage.upload(screenshotPath, screenshot);
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    const screenshotRef = this.storage.ref(screenshotPath);
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe(([clipProgress, screenshotProgress]) => {
      if (!clipProgress || !screenshotProgress) return;
      const total = clipProgress + screenshotProgress;
      this.percentage = total / 200;
    });
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async ([clipURL, screenshotURL]) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipURL,
            screenshotURL,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          const clipDocRef = await this.clipsService.createClip(clip);

          this.alertColor = 'green';
          this.alertMsg =
            'Success! Your clip is now ready to share with the world';
          this.showPercentage = false;
          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: () => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload faile! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }
}
