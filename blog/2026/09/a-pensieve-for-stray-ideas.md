---
title: "A Pensieve for stray ideas"
date: "2026-09-11"
category: "tools-and-workflows"
tags: [workflow, attention, tools]
excerpt: "A deliberately pressure-free place to put the thoughts I don't want to carry around — no reminders, no deadlines, nothing to keep up with. Just a basin you can look into, or not."
draft: false
---

# A Pensieve for stray ideas

In the Harry Potter books there is a basin called a Pensieve: you pull a thought out of your head, drop it into the liquid, and it sits there. You can go back and look at it later. Or never.

I built a small version of that. It is a plain Markdown list on my disk, and a thin strip that stays on the corner of my desktop and shows one entry at a time.

```ticker-demo
```

That is the whole interface. It rotates on its own; hover and it opens the full text, click to keep it open, double-click for the next one. It stops moving while you read.

## Why not just use a task list

Task managers carry an implicit promise: everything you write down is a commitment. They add due dates, priorities, overdue counters, streaks, reminders. That is exactly right for work that has to happen.

It is exactly wrong for a stray thought.

The moment recording an idea creates an obligation, I stop recording them. A note that says *you still haven't done this* is a note I learn to avoid. And so the most useful thoughts — the half-formed ones, the ones that are not yet a plan — are the ones that never make it out of my head, where they keep resurfacing at inconvenient moments.

## What this is instead

No reminders. No due dates. No priority field. No counts of things left undone. Nothing turns red, nothing accumulates, nothing is owed.

An entry has a title and, usually, one sentence of context. If it never happens, nothing is lost — the point was never to finish it. The point was to put it down somewhere I trust.

That is the entire design constraint, and it explains the odd choices:

- **One at a time.** A list on screen is a wall of unfinished things. A single line is just a thought passing by.
- **It disappears on its own.** The next entry replaces this one after a few seconds. There is no queue to clear.
- **It never asks.** No badge, no sound, no window that wants attention. If I ignore it for a week, it does not care.

## The part that actually helps

The value is not in reviewing the list. It is in the moment of writing something down.

I noticed that a thought I am holding onto keeps coming back — usually while I am doing something else that deserves the attention. Once it is written somewhere I trust, it stops interrupting. That is not a productivity claim; it is closer to putting a book back on the shelf instead of carrying it around the flat.

So the list is not an inbox. It is furniture.

## How it works

Two files and a small program:

- [`ideas.md`](https://github.com/Yn-Guo/portfolio/blob/main/ideas.md) is the source of truth — an ordinary Markdown file with bullets. Everything in it is public. A second file, `ideas.local.md`, holds anything I would rather not publish; it is git-ignored and only the desktop strip reads it.
- [`tools/idea-ticker/`](https://github.com/Yn-Guo/portfolio/tree/main/tools/idea-ticker) is the strip itself: PowerShell and WPF, no installer, no background service, no dependency to keep up to date. Drag it, close it, start it again tomorrow.

If an entry is short, only its title shows. If it has more to say, the rest appears when you hover or click. That is as complicated as I want this to get.

## What it will never do

It will not tell me what to work on. It will not remember anything for me, track progress, or congratulate me. It will not turn a nice thought into a debt.

It is a basin. You put something in, and you can look at it later, or not. That is the entire feature.
