# Panel palette and state tokens

Spec for a high-contrast status panel. Token names are a contract: use them verbatim.
Light is the default; dark applies under `prefers-color-scheme: dark`.
Ratios are WCAG 2.x relative-luminance contrast, rounded to 2 decimals.
Thresholds: text >= 4.5:1, borders and UI indicators >= 3:1.

## Base and accent tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0B1020` | Page background |
| `--surface` | `#F3F5FA` | `#161D35` | Cards and panels |
| `--text` | `#0B1020` | `#F2F5FF` | Primary text |
| `--text-muted` | `#444E68` | `#B3BBD2` | Secondary text |
| `--border` | `#7B849B` | `#7480A0` | Panel and control borders |
| `--accent` | `#0046D5` | `#8CB0FF` | Links, primary action, focus ring |

Text on `--accent` (buttons): use `--bg` (white in light, deep navy in dark).

## State tokens

| Token | Light | Dark |
|---|---|---|
| `--state-progress-bg` | `#FFC21A` | `#3D2C00` |
| `--state-progress-fg` | `#1A1200` | `#FFD45C` |
| `--state-progress-border` | `#8A5F00` | `#FFC21A` |
| `--state-approved-bg` | `#D3F4DD` | `#073A1B` |
| `--state-approved-fg` | `#05431A` | `#93F2B2` |
| `--state-approved-border` | `#1B7A38` | `#34C468` |
| `--state-error-bg` | `#FFDFE2` | `#4D0A16` |
| `--state-error-fg` | `#730010` | `#FFB8C0` |
| `--state-error-border` | `#C20E2D` | `#FF6277` |

In light, in-progress is vivid amber and uses dark text (`#1A1200`), never white.

## Labels, icons and color-blind notes

| State | Label | Icon | Why it stays distinct |
|---|---|---|---|
| In progress | En curso | `◐` | Only state with an amber fill, much lighter than green and red in the light scheme; the half-filled icon differs in shape. |
| Approved | Aprobado | `✓` | Green is paired with a check mark; its lightness differs from the amber and error fills, so red/green confusion does not hide it. |
| Error | Error | `✕` | Red is paired with a cross and the word "Error"; icon shape and label carry the meaning when red and green look alike. |

Always render icon plus label (icon `aria-hidden`, label as text). Color is never the only cue.

## Contrast ratios

### Base pairs

| Pair | Light | Dark | Min |
|---|---|---|---|
| `--text` on `--bg` | 18.93 | 17.38 | 4.5 |
| `--text` on `--surface` | 17.36 | 15.29 | 4.5 |
| `--text-muted` on `--bg` | 8.28 | 9.88 | 4.5 |
| `--text-muted` on `--surface` | 7.59 | 8.69 | 4.5 |
| `--accent` on `--bg` (links, focus ring) | 7.40 | 8.81 | 4.5 / 3 |
| `--accent` on `--surface` | 6.79 | 7.75 | 4.5 / 3 |
| `--bg` on `--accent` (button text) | 7.40 | 8.81 | 4.5 |
| `--border` on `--bg` | 3.74 | 4.81 | 3 |
| `--border` on `--surface` | 3.43 | 4.23 | 3 |

### State badge pairs

Format: light / dark.

| State | fg on bg (text) | border on badge bg | border on `--bg` | border on `--surface` |
|---|---|---|---|---|
| In progress | 11.49 / 9.51 | 3.49 / 8.33 | 5.65 / 11.71 | 5.18 / 10.29 |
| Approved | 9.73 / 9.56 | 4.57 / 5.67 | 5.40 / 8.33 | 4.95 / 7.33 |
| Error | 9.74 / 9.39 | 4.98 / 5.30 | 6.19 / 6.55 | 5.67 / 5.76 |

Every text pair is at least 4.5:1 (lowest 9.39) and every border pair at least 3:1 (lowest 3.49).

Note: badge fill against the page is low in light (1.18 to 1.62), so the badge boundary relies on the border token, which passes 3:1 on both `--bg` and `--surface`.

## Usage

- Badge: `background: var(--state-X-bg); color: var(--state-X-fg); border: 2px solid var(--state-X-border)`.
- Use `--accent` for focus rings (2px minimum).
- Ratios were computed with the WCAG formula; recheck if any hex changes.
