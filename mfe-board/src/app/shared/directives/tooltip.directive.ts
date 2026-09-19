import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, ViewContainerRef } from '@angular/core';
import { TooltipComponent, TooltipPosition } from '../components/tooltip/tooltip.component';

const SHOW_DELAY_MS = 100;
const TARGET_GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

/**
 * General-purpose hover/focus tooltip. Usage:
 *   <div [appTooltip]="'Jane Doe'">...</div>
 *   <div [appTooltip]="'Jane Doe'" appTooltipPosition="bottom">...</div>
 *
 * Renders an app-tooltip bubble into document.body (position: fixed) so it never
 * gets clipped by a scrollable/overflow:hidden ancestor.
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text = '';
  @Input() appTooltipPosition: TooltipPosition = 'top';

  private ref: ComponentRef<TooltipComponent> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private el: ElementRef<HTMLElement>, private vcr: ViewContainerRef) {}

  @HostListener('mouseenter') onMouseEnter(): void { this.scheduleShow(); }
  @HostListener('mouseleave') onMouseLeave(): void { this.hide(); }
  @HostListener('focusin') onFocusIn(): void { this.scheduleShow(); }
  @HostListener('focusout') onFocusOut(): void { this.hide(); }
  @HostListener('window:scroll') onWindowScroll(): void { this.hide(); }
  @HostListener('window:resize') onWindowResize(): void { this.hide(); }

  ngOnDestroy(): void {
    this.hide();
  }

  private scheduleShow(): void {
    if (!this.text?.trim()) return;
    this.clearShowTimer();
    this.showTimer = setTimeout(() => this.show(), SHOW_DELAY_MS);
  }

  private show(): void {
    if (this.ref) return;

    this.ref = this.vcr.createComponent(TooltipComponent);
    this.ref.instance.text = this.text;
    this.ref.instance.position = this.appTooltipPosition;
    this.ref.changeDetectorRef.detectChanges();

    document.body.appendChild(this.ref.location.nativeElement);
    this.position();

    // Flip visible on the next frame so the opacity/transform transition runs.
    requestAnimationFrame(() => {
      if (!this.ref) return;
      this.ref.instance.visible = true;
      this.ref.changeDetectorRef.detectChanges();
    });
  }

  private hide(): void {
    this.clearShowTimer();
    if (this.ref) {
      this.ref.destroy();
      this.ref = null;
    }
  }

  private clearShowTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private position(): void {
    if (!this.ref) return;
    const bubble = this.ref.location.nativeElement as HTMLElement;
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;

    let top = 0;
    let left = 0;

    switch (this.appTooltipPosition) {
      case 'bottom':
        top = hostRect.bottom + TARGET_GAP_PX;
        left = hostRect.left + hostRect.width / 2 - bubbleWidth / 2;
        break;
      case 'left':
        top = hostRect.top + hostRect.height / 2 - bubbleHeight / 2;
        left = hostRect.left - bubbleWidth - TARGET_GAP_PX;
        break;
      case 'right':
        top = hostRect.top + hostRect.height / 2 - bubbleHeight / 2;
        left = hostRect.right + TARGET_GAP_PX;
        break;
      default:
        top = hostRect.top - bubbleHeight - TARGET_GAP_PX;
        left = hostRect.left + hostRect.width / 2 - bubbleWidth / 2;
    }

    const maxLeft = window.innerWidth - bubbleWidth - VIEWPORT_MARGIN_PX;
    const maxTop = window.innerHeight - bubbleHeight - VIEWPORT_MARGIN_PX;
    left = Math.min(Math.max(left, VIEWPORT_MARGIN_PX), Math.max(maxLeft, VIEWPORT_MARGIN_PX));
    top = Math.min(Math.max(top, VIEWPORT_MARGIN_PX), Math.max(maxTop, VIEWPORT_MARGIN_PX));

    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
  }
}
