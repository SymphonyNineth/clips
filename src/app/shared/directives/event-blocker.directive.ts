import { Directive, HostListener } from '@angular/core';

// @Directive({
//   selector: '[app-event-blocker]',
// })
// export class EventBlockerDirective {
//   @HostListener('dragover', ['$event'])
//   @HostListener('drop', ['$event'])
//   public handleEvent(e: Event) {
//     console.log('Hello');
//     e.preventDefault();
//   }
// }

@Directive({
  selector: '[app-event-blocker]',
})
export class EventBlockerDirective {
  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  public handleEvent(event: Event) {
    event.preventDefault();
  }
}
