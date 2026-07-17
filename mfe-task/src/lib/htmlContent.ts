// TipTap emits "<p></p>" for an empty editor — strip tags and whitespace to
// tell that apart from real content. Shared by the comment composer and the
// inline comment-edit form (both submit-gate on the same check).
export function isHtmlEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
}
