// Shared drawing engine for the inline image-annotate overlay in RichTextEditor's
// ResizableImage NodeView. Plain, framework-agnostic canvas code (no React) since
// the NodeView itself is built with vanilla DOM.

export type Tool = 'pen' | 'highlighter' | 'rect' | 'circle' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  tool: 'pen' | 'highlighter';
  color: string;
  points: Point[];
}

export interface Shape {
  tool: 'rect' | 'circle';
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// The box is drag-defined by the user (like rect/circle) purely to size and
// position the text — it is never rendered itself, only the text is.
export interface TextAction {
  tool: 'text';
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}

export type Action = Stroke | Shape | TextAction;

// Font size is in the overlay/display canvas's own coordinate space — it scales
// up along with everything else when the final image is composited at native
// resolution (canvas text respects the current transform, same as line widths).
export const ANNOTATION_FONT_SIZE = 16;

// Matches the palette used for teams/statuses elsewhere in the app.
export const ANNOTATION_COLORS = ['#E09D34', '#DC4949', '#32B173', '#6a9eef', '#6155DD'];

export function boundingBox(start: Point, pt: Point): { x: number; y: number; w: number; h: number } {
  return {
    x: Math.min(start.x, pt.x),
    y: Math.min(start.y, pt.y),
    w: Math.abs(pt.x - start.x),
    h: Math.abs(pt.y - start.y),
  };
}

export function boundingShape(tool: 'rect' | 'circle', color: string, start: Point, pt: Point): Shape {
  return { tool, color, ...boundingBox(start, pt) };
}

// Splits on explicit newlines, then greedily wraps each paragraph's words to
// fit `maxWidth` — `ctx.font` must already be set before calling this.
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (current && maxWidth > 0 && ctx.measureText(test).width > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    lines.push(current);
  }
  return lines;
}

// Draws the full action list onto a canvas context — used both for the live
// overlay (transparent, no base image) and the final full-resolution composite
// (drawn on top of the image itself). Coordinates are in the context's own
// space; callers scale via ctx.scale() when compositing at a different
// resolution than the actions were recorded at.
export function drawActions(ctx: CanvasRenderingContext2D, actions: Action[]) {
  for (const action of actions) {
    if (action.tool === 'pen' || action.tool === 'highlighter') {
      const isHighlighter = action.tool === 'highlighter';
      if (action.points.length < 2) {
        // A quick tap with no drag — stamp a dot instead of drawing nothing.
        const [p] = action.points;
        if (!p) continue;
        ctx.beginPath();
        ctx.fillStyle = action.color;
        ctx.globalAlpha = isHighlighter ? 0.35 : 1;
        ctx.arc(p.x, p.y, (isHighlighter ? 18 : 3) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(action.points[0].x, action.points[0].y);
      for (const p of action.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = action.color;
      ctx.globalAlpha = isHighlighter ? 0.35 : 1;
      ctx.lineWidth = isHighlighter ? 18 : 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (action.tool === 'rect') {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = action.color;
      ctx.fillRect(action.x, action.y, action.w, action.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = action.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(action.x, action.y, action.w, action.h);
    } else if (action.tool === 'circle') {
      const cx = action.x + action.w / 2;
      const cy = action.y + action.h / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(action.w / 2), Math.abs(action.h / 2), 0, 0, Math.PI * 2);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = action.color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = action.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // text — only the text itself is rendered; the drag-box was purely for
      // sizing/positioning and leaves no border or fill of its own.
      ctx.font = `600 ${ANNOTATION_FONT_SIZE}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = action.color;
      ctx.textBaseline = 'top';
      ctx.globalAlpha = 1;
      const lineHeight = ANNOTATION_FONT_SIZE * 1.25;
      const lines = wrapText(ctx, action.text, action.w);
      lines.forEach((line, i) => ctx.fillText(line, action.x, action.y + i * lineHeight));
    }
  }
}
