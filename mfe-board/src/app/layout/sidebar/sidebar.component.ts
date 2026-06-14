import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  projects = [
    { name: 'Taskflow App',  color: '#6155DD' },
    { name: 'Design System', color: '#32B173' },
    { name: 'API Gateway',   color: '#E09D34' },
  ];
}
