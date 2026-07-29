import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Reusable confirmation modal (Yes / No).
 *
 * Presentational only — it never calls an API itself. The parent controls when it
 * shows (via *ngIf) and decides what happens on confirm, so the same modal can drive
 * any action (delete, archive, logout, …). While the parent's action runs it can flip
 * [loading]="true" to disable the buttons and show a busy label.
 *
 * @example
 *   <app-confirmation-modal
 *     *ngIf="confirmingDelete"
 *     title="Delete status?"
 *     message="This can't be undone."
 *     confirmText="Delete"
 *     variant="danger"
 *     [loading]="deleting"
 *     (confirm)="onDeleteConfirmed()"
 *     (cancel)="confirmingDelete = false">
 *   </app-confirmation-modal>
 */
@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmText = 'Yes';
  @Input() cancelText = 'No';
  /** Hide the cancel button for a single-action (acknowledge / "OK") modal. */
  @Input() showCancel = true;
  /** 'danger' styles the confirm button red (for destructive actions). */
  @Input() variant: 'default' | 'danger' = 'default';
  /** Set true by the parent while the confirm action is in flight. */
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (!this.loading) this.confirm.emit();
  }

  onCancel(): void {
    if (!this.loading) this.cancel.emit();
  }
}
