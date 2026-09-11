# Yanan Guo — Portfolio & Blog

Personal portfolio and blog for **Yanan Guo** — structural engineer and computational design
researcher. Built on the [GitVitae](https://github.com/git-vitae/git-vitae.github.io) template,
heavily customised for content, layout and PDF export.

- Live site: **not published yet** (GitHub Pages is not enabled on this repository)
- Single source of truth for content: [`portfolio.config.yaml`](portfolio.config.yaml)

---

## Local development

```bash
pnpm install
pnpm dev            # dev server on http://localhost:3000
pnpm check-config   # validate portfolio.config.yaml — run after every content edit
pnpm typecheck      # TypeScript check
pnpm build          # production build into dist/public
```

Other scripts: `pnpm lint`, `pnpm test`, `pnpm fix-config`, `pnpm serve`.

The config file is edited through Codex rather than by hand: its section syntax is easy to break,
and `pnpm check-config` is the gate that catches mistakes before a deploy.

---

## Content layout

| Path | What it holds |
| --- | --- |
| `portfolio.config.yaml` | All page content: identity and contacts, theme palette, about blocks, skills, experience, projects, education, publications, contact, plus the EN/ZH resume data and the blog categories |
| `blog/YYYY/MM/*.md` | Blog posts. Frontmatter carries `title`, `date`, `category`, `tags`, `excerpt`, `cover`, `draft` |
| `src/` | Sections and pages: `/` (portfolio), `#/blog`, `#/resume`, `#/application`; SVG project diagrams live in `src/components/sections/ProjectDiagram.tsx` |
| `scripts/` | `check-config.mjs` (validation), `generate-resume.mjs` (writes `public/resume.json` + `resume.md` before every build), and the two PDF export scripts |

Routing is hash-based, so the site works on GitHub Pages project URLs without a 404 fallback.

---

## PDF exports (local only)

With `pnpm dev` running, the export scripts drive a headless local browser and write into `exports/`:

```bash
pnpm pdf:resume          # exports/resume-en.pdf + exports/resume-zh.pdf
pnpm pdf:portfolio-en    # exports/portfolio-en.pdf
pnpm pdf:portfolio-zh    # exports/portfolio-zh.pdf
```

`exports/` is git-ignored. The PDFs are application material, contain personal contact details and
are not meant to be published.

---

## What is deliberately not in this repository

Project imagery (renders and site photos of client projects) stays on the local machine. Those files
are git-ignored because their rights are not cleared for publication.

In a production build each project therefore falls back to a generated SVG system diagram
(`diagram`, `diagramLabel` and `metrics` in the config). A project only uses its real images when it
carries `publicReady: true`. As a result the published `public/` folder contains just the avatar,
favicon, Open Graph image and the generated resume files — the build never depends on the local
imagery.

---

## Licensing

- Template code: MIT, © GitVitae — see [`license.md`](license.md)
- Personal content (text, layout customisations, blog posts, images): © 2026 Yanan Guo, all rights reserved
- Third-party imagery is not distributed with this repository
