import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ExportService } from '../../../core/services/export/export.service';
import { ExportFormat } from '../../interfaces/export.interface';

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team';
}

@Component({
  selector: 'app-export-tasks',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './export-tasks.component.html',
  styleUrl: './export-tasks.component.scss'
})
export class ExportTasksComponent implements OnInit {
  /** Team the tasks are being exported for. */
  @Input() teamId = '';
  @Input() teamName = '';

  /** Emitted when the user cancels / dismisses the modal, or after a successful export. */
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private exportService = inject(ExportService);

  form!: FormGroup;
  exporting = false;
  errorMsg = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      fileName: [`${slugify(this.teamName)}-tasks-export`, [Validators.required, Validators.pattern(/^\S+$/)]],
      format: ['Csv' as ExportFormat, Validators.required],
      isIncludeArchiveTask: [false],
    });
  }

  // Convenience accessor for template validation messages.
  get f() { return this.form.controls; }

  get extension(): string {
    return this.form?.get('format')?.value === 'Xlsx' ? '.xlsx' : '.csv';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.exporting = true;
    this.errorMsg = '';

    const { fileName, format, isIncludeArchiveTask } = this.form.getRawValue();

    this.exportService.exportTasks({ teamId: this.teamId, fileName, format, isIncludeArchiveTask }).subscribe({
      next: (blob) => {
        this.exporting = false;
        this.triggerDownload(blob, fileName, format);
        this.close.emit();
      },
      error: () => {
        this.exporting = false;
        this.errorMsg = 'Could not export tasks. Please try again.';
      },
    });
  }

  onCancel(): void {
    if (!this.exporting) this.close.emit();
  }

  private triggerDownload(blob: Blob, fileName: string, format: ExportFormat): void {
    const ext = format === 'Xlsx' ? 'xlsx' : 'csv';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
