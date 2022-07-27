import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;

  @Output() update = new EventEmitter();

  clipID = new FormControl('', {
    nonNullable: true,
  });
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  editForm = new FormGroup({ title: this.title });

  showAlert = false;
  alertColor: 'red' | 'green' | 'blue' = 'blue';
  alertMsg = 'Please wait! Clip is being updated!';

  inSubmission = false;

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }
  ngOnDestroy(): void {
    this.modal.unsubscribe('editClip');
  }
  ngOnChanges(): void {
    if (!this.activeClip) return;
    this.inSubmission = false;
    this.showAlert = false;
    this.clipID.setValue(this.activeClip.docID!);
    this.title.setValue(this.activeClip.title!);
  }

  async submit() {
    if (!this.activeClip) return;
    this.inSubmission = true;
    this.alertColor = 'blue';
    this.showAlert = true;
    this.alertMsg = 'Please wait! Clip is being updated!';
    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
      this.activeClip.title = this.title.value;
      this.update.emit(this.activeClip);
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later';
      return;
    }
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Title has been successfully updated';
  }
}
