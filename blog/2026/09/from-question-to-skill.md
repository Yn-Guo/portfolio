---
title: "I Asked How to Use Skills — and Ended Up Building One"
date: "2026-09-10"
category: "tools-and-workflows"
tags: [codex, agent-skills, knowledge-management, engineering-workflow]
excerpt: "A small skill that turns months of AI-assisted development records into a browsable glossary and an interactive project memory map."
draft: false
---

# I Asked How to Use Skills — and Ended Up Building One

I started with a simple question: how do I install and use third-party Agent Skills?

That question did not survive contact with the real problem. What I actually needed was not another skill from a catalogue. It was a way to navigate my own project memory — the hundreds of decisions buried in AI-assisted development conversations and the notes scattered across project folders.

Several iterations later, that need became a small skill called
[`dev-record-glossary`](https://github.com/Yn-Guo/dev-record-glossary).

## The problem: project memory lives in chat logs

AI-assisted development produces a strange kind of archive. The code and documents sit in a folder, but the reasoning behind them lives somewhere else: in conversation threads, in half-finished notes, in definitions that were refined over weeks.

When I returned to an older project, I usually remembered the conclusions but not where they came from. Search helped only when I already knew the exact word. I could not answer simple questions quickly:

- Which file contains what?
- Where was this component or contract discussed?
- Which terms belong to this project, and what do they mean here?
- What was the latest state of progress?

I did not need a summary. I needed a map.

## What the tool does

`dev-record-glossary` reads a project's local development records — Codex conversation threads tied to that project, plus optional Markdown notes from a project folder — and produces two self-contained outputs:

- **`glossary.md`** — every unit (a conversation or a file) with the keywords that characterise it, plus one-line definitions and cross-references.
- **`network.html`** — an interactive map: outer nodes are terms, inner nodes are units. Pan, zoom, rotate, filter by source or unit, click a node to inspect its details. A gold marker follows the current point of progress.

No server, no database. The outputs are plain files that can be regenerated whenever the project moves.

## How it works

The pipeline is deliberately small:

1. Discover Codex threads whose working directory belongs to the project root.
2. Collect local Markdown files as additional units.
3. Tokenise each unit with a profile suited to its type — code-oriented or prose-oriented.
4. Score terms per unit, merge all unit keywords into one project-level index, and extract a definitional snippet for every term/unit pair.
5. Render the result into a self-contained HTML view and a Markdown glossary.

One small piece of logic turned out to matter more than the rest: the project boundary.

```python
cwd = normalise(cwd)
if cwd != project_root and not cwd.startswith(project_root + os.sep):
    continue  # not part of this project
```

Before that rule, a project whose name appeared in another path could absorb unrelated conversations. A strict boundary made the output trustworthy. Internal sub-agent threads were excluded for the same reason: they are implementation bookkeeping, not user-facing project records.

Configuration is intentionally explicit:

```json
{
  "term_definitions": {
    "domain term": "What it means in this project."
  },
  "jieba_terms": ["multi-word", "project-specific", "terms"],
  "stopwords_extra": ["generic", "words"],
  "final_pin": "name of the unit that marks current progress"
}
```

The automatic layer gives a usable first draft. The configuration layer is where a project's own vocabulary accumulates over time.

## Five decisions that made it useful

**One project, one source.** Conversations and local files are both units of the same project, not two competing sources. This keeps the graph coherent and the filters meaningful.

**Full index, clean view.** The data keeps the union of every unit's keywords. The graph only shows the top terms at first, so the picture stays readable without throwing information away.

**A current-progress marker, not a "final version".** The latest unit is highlighted by default; a config option can pin a specific unit when the newest conversation is not the true current state.

**Definitions first, polish later.** Each term starts with an automatically selected definitional sentence from the records. Curated definitions can override it, one term at a time.

**Boundaries are part of the design.** Exact project roots, excluded sub-agent threads, and separate runs for separate projects — all of this prevents a memory map from becoming a memory blur.

## Two projects, two vocabularies

The tool was tested on two very different projects, anonymised here as Project A and Project B.

**Project A** is a parametric engineering toolchain: many development sessions, code-like vocabulary, numbered components, contract objects and file names. The identifier-aware scoring worked well. In its final run, Project A produced 32 units and 388 terms, and the network made the architecture legible at a glance.

![Project A mapped: term and unit nodes connected by co-occurrence, with the gold marker on the current point of progress](blog/dev-record-glossary-project-a.jpg)

*Project A: 32 units, 388 terms. Numbered components, contract objects and file names dominate the vocabulary — what the identifier-aware scoring is tuned for.*

**Project B** is a document-heavy standards knowledge base. It has fewer sessions, and its vocabulary is prose rather than code: concepts, clauses, OCR artefacts. The same scoring approach still produced a useful map (14 units, 180 terms), but the difference was obvious. A term profile tuned for code does not automatically understand a text-heavy knowledge project.

![Project B mapped: the same kind of network, but with no code identifiers — standards, clauses and file formats instead](blog/dev-record-glossary-project-b.jpg)

*Project B: 14 units, 180 terms. Prose and file formats rather than code, which makes the same scoring produce a looser, flatter map.*

That contrast is the most useful thing the test revealed. The algorithm is shared; the vocabulary profile is not.

![A notes-only project mapped, with one term selected: the detail panel lists the units that use it](blog/dev-record-glossary-notes-project.jpg)

*Any node opens a detail panel — here a term is selected and the units that use it are listed. This map comes from a third, notes-only project (9 Markdown files); the same view works for the code-heavy ones.*

## What it is not

This is not a general-purpose product. It is bound to the local Codex record store, it expects some human curation, and it does not yet understand complex project hierarchies. The visualisation is hand-rolled rather than a polished charting library.

That is acceptable. A personal tool earns its place by solving one real problem well, not by pretending to be universal.

## What is next

Two directions are already clear.

**1. Better term profiles.** The next version should classify extracted terms into at least three groups: knowledge-base terms, domain terminology, and project nodes. Each group needs its own filtering and scoring rules, so a code-oriented project and a document-oriented project produce maps of comparable quality.

**2. More live and flexible tracking.** Instead of regenerating a static map after the fact, the tool should notice progress as work happens, follow it automatically, identify sub-project lines, and grow tree branches for them. The visualisation would then need hierarchy controls rather than a flat term/unit graph.

Neither direction is implemented yet. They are the natural next layer on top of a foundation that already works.

## The code

The full script is self-contained and now public:
[github.com/Yn-Guo/dev-record-glossary](https://github.com/Yn-Guo/dev-record-glossary).

If someone else finds one useful design decision in it — the project boundary, the full-index/clean-view split, or the configurable progress marker — that is enough.
