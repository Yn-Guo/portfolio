# Idea ticker

A small always-on-top window that cycles through the bullet items in
[`../../ideas.md`](../../ideas.md) — a personal idea integrator, not a task
manager: no deadlines, no obligations, just the thoughts currently in play.

## Run it

Double-click `idea-ticker.vbs` — it starts Windows PowerShell with no console
window at all. From a terminal you can also run:

```powershell
powershell -NoProfile -STA -ExecutionPolicy Bypass -File .\idea-ticker.ps1
```

If the window does not appear, `idea-ticker.log` next to the script holds the
status of the last run (it is rewritten on every start).

## What it shows

The strip normally shows only the **title** of the current idea — the bold part of
the bullet, in a larger size — plus a small `2 / 5` counter and a thin progress bar
that fills until the next rotation. The full sentence appears when you hover or
pin it.

## Controls

| Action | Result |
| --- | --- |
| Drag | Move the window |
| Hover | Peek at the full text |
| Single click | Keep the text open (click again to collapse) |
| Double-click | Next idea |
| Right-click | Menu: next, pause/resume, keep text open, open `ideas.md`, close |
| Esc | Close |

## Where the ideas come from

The script looks for `ideas.md` by walking up from its own folder, then reads the
bullet items in order. If a file called `ideas.local.md` sits next to it, those
items are appended — that file is git-ignored, so private thoughts stay local.

Items are ordinary Markdown bullets; `- [ ]` checkboxes work too, and `**bold**`
labels are shown as plain text.

## Start automatically (optional)

Create a shortcut to `idea-ticker.vbs` in `shell:startup` (press `Win+R`,
type `shell:startup`, drop the shortcut in). Remove it whenever it stops being
useful.

## Diagnostics

```powershell
powershell -NoProfile -STA -ExecutionPolicy Bypass -File .\idea-ticker.ps1 -SelfTest
```

prints which file was found, how many items were parsed and whether the window
definition loaded — without opening any window.
