import { Component, OnInit } from '@angular/core';
import { Params, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  sort(e: Event) {
    const { value } = e.target as HTMLSelectElement;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  async copyToClipboard(e: MouseEvent, docID: string | undefined) {
    e.preventDefault();
    if (docID) {
      const url = `${location.origin}/clip/${docID}`;
      await navigator.clipboard.writeText(url);
      alert('Link copied');
    }
  }

  openModal(e: Event, clip: IClip) {
    e.preventDefault();
    this.activeClip = clip;
    this.modal.toggleModal('editClip');
  }

  update(updatedClip: IClip) {
    this.clips.forEach((clip, i) => {
      if (clip.docID === updatedClip.docID) {
        this.clips[i].title = updatedClip.title;
      }
    });
  }

  async deleteClip(e: Event, clip: IClip) {
    e.preventDefault();
    await this.clipService.deleteClip(clip);
    this.clips.forEach((el, i) => {
      if (el.docID === clip.docID) {
        this.clips.splice(i, 1);
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    });
    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => {
        this.clips.push({
          ...doc.data(),
          docID: doc.id,
        });
      });
    });
  }
}
