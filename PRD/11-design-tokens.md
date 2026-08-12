# Design Tokens — Color

The full color palette for Taskflow, in both dark and light mode.

Every color in the product comes from a CSS custom property. **Dark is the default**, declared on
`:root`. **Light is an override**, declared on `:root[data-theme="light"]` — the theme is switched by
stamping `data-theme="light"` on the `<html>` element.

## Source of truth

The identical token block is declared in all three apps:

| App | File |
|---|---|
| Shell | `shell/app/globals.css` |
| Task MFE | `mfe-task/src/app/globals.css` |
| Board MFE | `mfe-board/src/styles.scss` |

There is no shared stylesheet — the three apps are deployed independently, so the block is
duplicated. **A change to any token must be applied to all three files in the same commit.**

---

## Surfaces

Backgrounds, ordered from the page ground upward. In dark mode the scale gets lighter as it
elevates; in light mode it gets darker — except `bg-700`, which is pure white for cards.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-bg-900` | `#121215` | `#F7F7F8` | Page background |
| `--color-bg-800` | `#1A1A1E` | `#EFEFF1` | Sunken panels, editor surface, scrollbar track |
| `--color-bg-700` | `#222227` | `#FFFFFF` | Card / modal surface |
| `--color-bg-600` | `#2C2C32` | `#E4E4E7` | Inputs, code blocks, hover fills |
| `--color-bg-500` | `#393940` | `#D4D4D8` | Dividers on raised surfaces, scrollbar thumb |
| `--color-border-subtle` | `#2C2C32` | `#E4E4E7` | Default border — same value as `bg-600` |

## Text

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-text-100` | `#F4F3F0` | `#18181B` | Primary text, headings |
| `--color-text-200` | `#ABAAA5` | `#52525B` | Secondary text, labels |
| `--color-text-300` | `#6E6C6A` | `#8A8A93` | Muted text, placeholders, captions |
| `--color-prose-body` | `#CBCAC6` | `#3F3F46` | Rendered rich-text body — **Task + Board only** |
| `--color-editor-text` | `#E5E4E0` | `#27272A` | Tiptap editor body — **Task MFE only** |

`text-300` sits near the low end of contrast on both grounds. Use it for captions and placeholders,
not for body copy.

## Accent

Indigo. `--color-accent` is the one value that is **identical in both modes** — only its hover state
flips direction: lighter on dark, darker on light.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-accent` | `#6155DD` | `#6155DD` | Primary buttons, focus rings, active nav, carets |
| `--color-accent-hover` | `#766BE8` | `#4F44C7` | Hover state; also accent-colored **text** |
| `--color-accent-bg` | `#261F42` | `#EEECFC` | Tinted accent surface — selected rows, badges |

Use `--color-accent-hover` — not `--color-accent` — when the accent is used as small text on the page
ground. On `#121215`, raw `#6155DD` lands around 3.5:1.

## Status

Three semantic hues, each with a paired tinted background for pills and banners.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-status-green` | `#32B173` | `#178350` | Done, success, inline code |
| `--color-status-amber` | `#E09D34` | `#A6690E` | In progress, warning |
| `--color-status-red` | `#DC4949` | `#C23636` | Blocked, overdue, destructive |
| `--color-green-bg` | `#123822` | `#E4F5EC` | Green pill / banner fill |
| `--color-amber-bg` | `#45320D` | `#FBF0DD` | Amber pill / banner fill |
| `--color-red-bg` | `#451515` | `#FBE6E6` | Red pill / banner fill |

Semantic color is independent of the accent — never substitute indigo for a status hue.

## Shadows and overlays

Dark mode casts shadows in pure black; light mode tints them with the primary ink (`#18181B`) so
they read as part of the neutral ramp rather than as grey haze.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3)` | `0 1px 3px rgba(24,24,27,.08), 0 1px 2px rgba(24,24,27,.06)` | Cards |
| `--shadow-elevated` | `0 4px 16px rgba(0,0,0,.5)` | `0 4px 16px rgba(24,24,27,.10)` | Modals, tooltips, popovers |
| `--shadow-glow` | `0 0 20px rgba(97,85,221,.15)` | `0 0 20px rgba(97,85,221,.10)` | Accent emphasis |
| `--overlay-accent-hover` | `rgba(97,85,221,.3)` | `rgba(97,85,221,.18)` | Translucent accent hover |
| `--overlay-selection` | `rgba(97,85,221,.3)` | `rgba(97,85,221,.18)` | `::selection` background |

---

## Using tokens

### Next.js apps (Shell, Task MFE)

Every token is exposed as a Tailwind color under the same name minus the `--color-` prefix. Declared
in `shell/tailwind.config.ts` and `mfe-task/tailwind.config.ts`.

| CSS variable | Tailwind class |
|---|---|
| `--color-bg-700` | `bg-bg-700` |
| `--color-text-200` | `text-text-200` |
| `--color-accent` | `bg-accent` / `text-accent` / `border-accent` |
| `--color-border-subtle` | `border-border-subtle` |
| `--shadow-card` | `shadow-card` |
| `--shadow-elevated` | `shadow-elevated` |
| `--shadow-glow` | `shadow-glow` |

```tsx
// ✅ correct
<div className="bg-bg-700 border border-border-subtle text-text-100 shadow-card">

// ❌ wrong — breaks in light mode
<div className="bg-[#222227] text-[#F4F3F0]">
```

Never write a hex literal in a component. A hardcoded color does not respond to the theme switch.

### Board MFE (Angular)

No Tailwind. Reference the variables directly in component SCSS:

```scss
.board-card {
  background: var(--color-bg-700);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-100);
  box-shadow: var(--shadow-card);
}
```

### Non-color values that ship with the palette

Declared alongside the colors in the Tailwind configs:

| Concern | Value |
|---|---|
| Font family | `Inter, system-ui, sans-serif` |
| Card radius | `10px` (`rounded-card`) |
| Theme transition | `0.25s ease` on background, color, border, shadow, fill, stroke |
| Focus ring | `2px solid var(--color-accent)`, `2px` offset |
| Reduced motion | All transitions removed under `prefers-reduced-motion: reduce` |

---

## Passing the theme to the AI chatbot

The chatbot (`NEXT_PUBLIC_CHATBOT_URL`) is embedded in `/chat` as an iframe and is deployed on its
own origin, so it never receives the `taskflow_session` / `taskflow_theme` cookies. The shell passes
what the chatbot needs on the iframe URL instead:

```
https://taskflow-chatbot-six.vercel.app?theme=dark&name=Amit+Das
```

| Param | Source | Purpose |
|---|---|---|
| `theme` | `document.documentElement.dataset.theme` | `dark` or `light` — which token block to paint |
| `name` | `useAuth().name` (wraps `useMe`) | Display name; the chatbot derives its own avatar initials from it |

`name` is omitted from the URL when empty, so the chatbot must treat it as optional and fall back to
a generic avatar. The display name lands in the chatbot deployment's access logs — acceptable for a
name, but do not extend this channel to carry the email, the session token, or any other identifier.

`shell/app/(shell)/chat/page.tsx` builds this in an effect rather than during render — the theme
comes from the cookie the root layout stamped onto `<html>`, so reading it during render would
mismatch the server-rendered markup. The effect waits for `useAuth().isPending` to clear so the name
is present on first load, and the src is written to state only once: recomputing it would reload the
iframe and drop the conversation.

**What the chatbot app must do:** read both params from its own query string on boot. Stamp
`data-theme="light"` on its `<html>` when `theme` is `light`, defaulting to dark for any other value
or a missing param. The token block above should be duplicated into the chatbot's stylesheet the
same way it is in the three other apps.

The param is read once, at mount. That is sufficient today because the only theme switch lives on
the Settings screen — by the time the user reaches `/chat`, the iframe mounts with the current
value. There is no live `postMessage` channel: if a theme toggle is ever added to the topbar or to
the chat screen itself, one has to be added so the open iframe can be updated in place.

---

## Known drift

The three token blocks are not currently identical. Two tokens are missing from some apps:

| Token | Shell | Task MFE | Board MFE |
|---|---|---|---|
| `--color-prose-body` | ✗ | ✓ | ✓ |
| `--color-editor-text` | ✗ | ✓ | ✗ |

This is harmless today — only the Task MFE renders the Tiptap editor, and the Shell renders no rich
text. It becomes a bug the moment rich-text content moves into another app, so add the missing
tokens when that happens rather than falling back to a hardcoded value.
