import { Injectable } from '@angular/core';
interface IModal {
  id: string;
  visible: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}
  isModalOpen(id: string): Boolean {
    return Boolean(this.modals.find((modal) => modal.id === id)?.visible);
  }
  toggleModal(id: string): void {
    const found = this.modals.find((modal) => modal.id === id);
    if (!found) return;
    found.visible = !found.visible;
  }
  register(id: string) {
    this.modals.push({ id, visible: false });
  }
  unsubscribe(id: string): void {
    this.modals = this.modals.filter((modal) => modal.id !== id);
  }
}
