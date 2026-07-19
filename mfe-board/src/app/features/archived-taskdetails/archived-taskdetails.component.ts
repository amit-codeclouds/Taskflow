import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiArchivedTask, ArchivedAssignee } from '../../shared/interfaces/board.interface';
import { TeamService } from '../../core/services/team/team.service';

// One assignee as rendered — avatar + name.
interface AssigneeView {
  name: string;
  initials: string;
  avatarUrl?: string;
}

// View model for the archived-task detail page.
interface TaskDetail {
  id: string;
  number: string;               // "#42"
  title: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  descriptionHtml: string;      // CKEditor HTML (may be empty)
  progress: number;
  expectedCompletion: string;   // formatted, or ''
  createdAt: string;            // formatted, or ''
  updatedAt: string;            // formatted, or ''
  assignees: AssigneeView[];
}

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

@Component({
  selector: 'app-archived-taskdetails',
  standalone: true,
  imports: [NgFor, NgIf, TitleCasePipe],
  templateUrl: './archived-taskdetails.component.html',
  styleUrl: './archived-taskdetails.component.scss'
})
export class ArchivedTaskdetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private teamService = inject(TeamService);

  task: TaskDetail | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('taskId') ?? '';
    if (!taskId) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.teamService.getArchivedTask(taskId).subscribe({
      next: (t) => {
        this.task = this.toDetail(t);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private toDetail(task: ApiArchivedTask): TaskDetail {
    const num = task.taskNumber ?? task.number;
    const rawAssignees = task.assigneeDetails ?? task.assignees ?? [];
    return {
      id: task.id,
      number: num != null ? `#${num}` : task.id,
      title: task.title,
      priority: (task.priority?.toLowerCase() as TaskDetail['priority']) ?? 'medium',
      label: task.label ?? '',
      descriptionHtml: task.description ?? '',
      progress: task.progress ?? 0,
      expectedCompletion: formatDate(task.expectedCompletion),
      createdAt: formatDate(task.createdAt),
      updatedAt: formatDate(task.updatedAt),
      assignees: rawAssignees
        .map((a: ArchivedAssignee) => ({
          name: a.name,
          initials: a.avatarInitials?.trim() || initialsFromName(a.name),
          avatarUrl: a.avatarUrl?.trim() || undefined,
        }))
        .filter(a => a.name || a.avatarUrl),
    };
  }

  goBack(): void {
    this.location.back();
  }
}
