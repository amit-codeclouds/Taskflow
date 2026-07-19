import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TeamService } from '../../../core/services/team/team.service';
import { CreateStatusPayload } from '../../interfaces/board.interface';

@Component({
  selector: 'app-create-status',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './create-status.component.html',
  styleUrl: './create-status.component.scss'
})
export class CreateStatusComponent implements OnInit {
  /** Team the status is being created for — prefills the (read-only) TeamID field. */
  @Input() teamId = '';
  @Input() teamName = '';

  /** Emitted when the user cancels / dismisses the modal. */
  @Output() close = new EventEmitter<void>();
  /** Emitted after a status is successfully created. */
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);

  form!: FormGroup;
  saving = false;
  errorMsg = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      position: [0, [Validators.required, Validators.min(0)]],
      teamId: [{ value: this.teamId, disabled: true }, Validators.required],
      isArchievable: [false],
    });
  }

  // Convenience accessor for template validation messages.
  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = '';

    // getRawValue() includes the disabled teamId control.
    const payload = this.form.getRawValue() as CreateStatusPayload;

    this.teamService.createStatus(payload).subscribe({
      next: () => {
        this.saving = false;
        this.created.emit();
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Could not create status. Please try again.';
      },
    });
  }

  onCancel(): void {
    if (!this.saving) this.close.emit();
  }
}
