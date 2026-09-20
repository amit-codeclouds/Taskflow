import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { ThemeService } from '../../../core/theme.service';

/**
 * Sun/Moon icon-swap theme toggle — mirrors shell/mfe-task's React ThemeToggle so
 * all three zones offer the same control, reading/writing the same taskflow_theme
 * cookie the Settings page (owned by the shell zone) also uses.
 *
 * @example
 *   <app-theme-toggle></app-theme-toggle>
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [NgIf],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
