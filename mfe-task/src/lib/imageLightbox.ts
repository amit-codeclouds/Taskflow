// Plain, framework-agnostic full-screen image viewer — usable both from the
// vanilla-DOM RichTextEditor NodeView and from plain React components (as a
// native click handler), without needing a React portal/state in either place.

let activeOverlay: HTMLDivElement | null = null;

export function openImageLightbox(src: string, alt = ''): void {
  if (activeOverlay || !src) return;

  const overlay = document.createElement('div');
  overlay.className = 'tf-lightbox-overlay';

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.className = 'tf-lightbox-img';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'tf-lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
  activeOverlay = overlay;

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  function close() {
    overlay.removeEventListener('click', onOverlayClick);
    closeBtn.removeEventListener('click', close);
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    document.body.style.overflow = previousOverflow;
    activeOverlay = null;
  }

  function onOverlayClick(e: MouseEvent) {
    if (e.target === overlay) close();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  overlay.addEventListener('click', onOverlayClick);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKeyDown);
}
