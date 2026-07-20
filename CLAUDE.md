# Treasure Hunt Proposal — Project Context

This project is a set of static HTML pages for an in-person, treasure-hunt-style
marriage proposal. A group of 6 friends + the girlfriend physically walk/drive
between real-world stops in a town. At each stop, they open a page like
`index.html` on a phone, solve tasks, and the page reveals the next clue
(a riddle, coordinates, or directions to the next physical location).

The final stop is the user's home, where he proposes — that part happens
offline and isn't part of this codebase.

## Why this exists / the story so far

The user is proposing to his girlfriend. 7 people are involved total: the
user (who sets everything up in advance and waits at home for the actual
proposal — he is NOT part of the walking group) and 6 others who do the
hunt together, one of whom is the girlfriend. It's explicitly **not a
competition** — the whole group solves each stop together.

**Confirmed structure** (decided by the user, applies to every stop):
1. The group arrives and the tasks are delivered somehow (envelope, QR
   code, a person handing something over, etc.).
2. Each stop has 2–3 tasks: one is personalized to the girlfriend
   specifically (an inside reference/memory only she'd recognize), and
   one or two are for the whole group (solvable by anyone).
3. Solving all of a stop's tasks together produces a clue.
4. Solving that clue reveals two things: the next physical location, and
   what exactly to do/look for once they get there.

**Confirmed stop-level detail:** one stop is a **library**, where the
girlfriend's personal task is to open a specific book to a specific
page/line written in **Norwegian** (she knows a little Norwegian, nobody
else does) and translate it. The stop immediately after the library is a
café called **Bohemian Kids**. (Exactly how the group's task at the
library is combined with her translation into one clue was sketched as
an illustrative example in planning chat — not finalized. Treat any
specific wording like "the word 'barn'" or "call-number scavenger hunt"
as an example, not a locked decision, unless the user says otherwise.)

**Raw material the user is still placing into a final order** — these
were the original tasks/places he brainstormed, not yet all assigned to
specific stops:
- Tasks: a custom photo/jigsaw puzzle that leads somewhere meaningful to
  the couple, a Norwegian translation (→ used at the library, see above),
  determining something from Roman numerals, determining months from
  knuckles.
- Places: the library (confirmed, see above), under a fence/bench/
  building, a friend's home, a QR code taped somewhere or split into two
  halves, and a "find words in the environment" task (shop names, signs).

**Logistics constraint the plan works around:** the user's home is far
outside the city where the hunt takes place, so the route can't be pure
walking. Current approach: cluster the walkable city-center stops
together, then use 1–2 driving legs (car/friends' cars) to bridge to the
outskirts and finally home, rather than forcing everyone to walk the
whole distance.

**The jigsaw mechanic (confirmed concept, open on details):** physical
jigsaw pieces are handed out progressively across multiple stops (not
all at once). Once assembled, the completed image doesn't point to a
"you two" spot directly — it points to **the couple's actual hometown**
(distinct from the city where the hunt happens). From there, a further,
more personal clue — something only the girlfriend would recognize (a
specific tree, a turn in the road, a mailbox) — is meant to lead
specifically to the house. Exactly what image goes on the jigsaw and how
the "arrived in town → now go to this house" handoff works are still
open questions from planning chat (options discussed: a local
accomplice/family member handing off a final note, a physical key, or a
personally-recognizable landmark).

**Idea bank from planning chat** (menus of options the user was choosing
from — not a checklist to implement wholesale, just context for what he
might mean if he references something briefly):
- *Task categories brainstormed:* environmental (counting/spotting things
  in the surroundings), physical (padlocks, puzzle boxes, disentanglement
  puzzles, bottle labyrinths), question-based (Leipzig trivia, personal/
  relationship trivia, science trivia), and mental (ciphers, logic
  riddles, wordplay, memory games).
- *Delivery media brainstormed:* hidden physical containers (envelopes,
  lockboxes, hollowed-out books, magnetic key holders), QR codes, people
  stationed to hand things over (friends, shopkeepers), and fully digital
  options (scheduled texts, a video message, a small website per stop —
  this repo is that "small website" approach).
- *Explored but unresolved:* a triangulation/circumcenter-style puzzle
  (three points the same distance from a target location); an acrostic
  wordplay attempt using the real text of a Leipzig railway monument
  plaque to spell out a word — this hit a dead end (the plaque has no
  I or Y words) and was left unresolved with a few workarounds suggested
  but not chosen.

## Deployment
- Pure HTML/CSS/JS, no build step, no framework, no npm dependencies.
- Deployed via GitHub Pages (push to a repo, enable Pages, done).
- Each stop is its own self-contained `.html` file — CSS and JS inline in
  the same file, so it stays copy-pasteable and simple to host.
- Viewed exclusively on phones during the event — always design mobile-first
  (~375–430px viewport), not desktop.
- No localStorage/sessionStorage — everything is in-memory JS state for the
  single viewing session (deliberate choice, not an oversight).

## Design system ("sealed correspondence" theme)
The visual concept: each task is a "note" the group opens by solving it —
"unsealing" it. Progress is shown as a strand of small wax-seal dots that
fill in gold as tasks are solved. Solving everything on a page reveals a
final "Unsealed" section with the actual next-location clue.

- **Palette** (CSS custom properties defined in `:root`):
  `--ink #17101f`, `--plum #2a1a34`, `--wine #3a1d30` (dark gradient bg),
  `--parchment #f4ecdd` (primary text), `--muted #b2a5c2` (secondary text),
  `--seal #d6a05c` / `--seal-light #f0c988` / `--seal-deep #9c6a34` (gold accent,
  the core "wax seal" color), `--mint #8fdba8` (correct), `--rose #e69090` (wrong).
- **Type roles** — three fonts, each with one job, don't mix them:
    - `Fraunces` (serif, italic for emphasis) — headings, section titles, the
      final reveal moment.
    - `Manrope` — body copy, questions, buttons, inputs.
    - `IBM Plex Mono` — small data-like bits only: the eyebrow/postmark label,
      progress counter, "Note 01" / "Track 01" numbering.
- **Cards** use a small border-radius (6px) with a nested inner border
  (`.card::before` with `inset: 6px`) to read as stationery/invitation cards,
  not generic soft "app" bubbles. Don't switch this to large rounded corners
  or drop shadows — that breaks the intended look.
- **Signature interaction**: solving a task shows a small gold "&" stamp
  medallion popping onto the card corner (`.stamp` element), and lights up
  one dot in the seal-strand progress row. Keep this consistent if adding
  new task types — the "&" glyph is the one recurring motif, don't add
  additional unrelated icons/emoji on top of it.
- Section names are intentional wordplay on the letter/correspondence theme:
  riddles section = "The Notes", song section = "Enclosures" (an "enclosure"
  = something tucked inside a letter), final section = "Unsealed". Keep this
  vocabulary if adding sections — don't rename to generic terms like
  "Puzzles" or "Music Challenge".

## File structure / content editing pattern
Every stop page follows the same pattern: design/logic code stays fixed,
and there's one clearly marked config block near the top of the `<script>`
tag (look for `EDIT YOUR CONTENT HERE`) containing:

- `STOP_LABEL`, `PAGE_TITLE`, `PAGE_SUBTITLE` — header text.
- `RIDDLES` — array of `{ question, answers: [...], hint }`. `answers` can
  list multiple accepted variants. `hint` is optional (empty string hides
  the hint button).
- `SONGS` — array of `{ src, answers: [...], hint }` for the "Enclosures"
  listening challenge. `src` is a path/URL to an audio file. The whole
  point of this section is that song titles/artists are NOT shown anywhere
  in the UI — the group has to guess by ear. Don't add visible title/artist
  text anywhere in the song rendering.
- `FINAL_CLUE_HTML` — raw HTML string shown once every riddle and song on
  the page is solved correctly. Can contain plain text or an `<img>` tag.

When adding a new stop, duplicate the existing HTML file and only touch
this config block — don't need to touch CSS/JS unless changing the design
system itself.

## Answer-checking behavior (intentional, don't "fix")
`normalize()` in the JS lowercases, trims, strips punctuation, and maps
å→a, æ→ae, ø→o, ä→a, ö→o, ü→u, ß→ss before comparing answers. This is
deliberate — one of the riddles involves a Norwegian translation, and
friends typing on phone keyboards may not have easy access to å/ø/æ, so
matching is intentionally lenient. Keep this normalization if you touch
the answer-checking logic.

## Current state
- `index.html` — the page template/design system, currently filled with
  generic placeholder text ("Replace this with your first riddle...").
  It's intended to become the **library stop** described above (Norwegian
  translation task + a group task, leading to Bohemian Kids café) once
  the user finalizes real riddle wording, real songs, and the real
  next-clue text — but none of that is written in yet.
- No other stop pages exist yet. Plan is to duplicate this file per stop
  as the user finalizes each location's tasks.
- No audio files have been added yet — `SONGS[].src` is intentionally
  empty; the player gracefully no-ops (shows an alert to the *creator*
  during testing) until real files are added.

## What NOT to change without asking
- Don't swap in a UI framework, external JS libraries, or a build step —
  the whole point is a single file that works by just opening it / hosting
  it as-is on GitHub Pages.
- Don't add localStorage/sessionStorage.
- Don't add real riddle/song content on your own — that's specific to the
  user and his girlfriend and should come from him.