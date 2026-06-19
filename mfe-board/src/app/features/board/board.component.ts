import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { BOARD_DATA, TEAMS } from '../../shared/static/boardData';
import { Column, Task, Team } from '../../shared/interfaces/board.interface';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  teams = TEAMS;
  selectedTeam = TEAMS[0];
  dropdownOpen = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const teamId = params.get('teamId');
      const match = TEAMS.find(t => t.id === teamId);
      if (match) {
        this.selectedTeam = match;
      } else if (teamId) {
        this.router.navigate(['/']);
      }
    });
  }

  get columns(): Column[] { return BOARD_DATA[this.selectedTeam.id] ?? []; }
  get totalTasks(): number { return this.columns.reduce((s, c) => s + c.tasks.length, 0); }
  get connectedDropLists(): string[] { return this.columns.map(c => c.id); }

  toggleDropdown(e: Event) { e.stopPropagation(); this.dropdownOpen = !this.dropdownOpen; }

  selectTeam(team: Team, e: Event) {
    e.stopPropagation();
    this.selectedTeam = team;
    this.dropdownOpen = false;
    this.router.navigate(['/', team.id]);
  }

  onTaskDropped(event: CdkDragDrop<Task[]>, target: Column) {
    if (event.previousContainer === event.container) {
      moveItemInArray(target.tasks, event.previousIndex, event.currentIndex);
    } else {
      const source = this.columns.find(c => c.id === event.previousContainer.id);
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      if (source) source.count = source.tasks.length;
      target.count = target.tasks.length;
    }
  }

  @HostListener('document:click')
  closeDropdown() { this.dropdownOpen = false; }
}
