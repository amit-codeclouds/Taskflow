import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Presentational tooltip bubble rendered by TooltipDirective. Not meant to be
 * used directly in templates — apply [appTooltip]="'text'" to an element instead.
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [NgClass],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: TooltipPosition = 'top';
  @Input() visible = false;
}
