import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() color: 'red' | 'green' | 'blue' = 'blue';
  get bgColor() {
    return `bg-${this.color}-400`;
  }
}
