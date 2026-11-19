import type { Publication } from '@/portfolio.config';

/**
 * BibTeX / Vancouver citation helpers.
 *
 * Publication entries in `portfolio.config.yaml` carry the plain display
 * strings used on the site. When a venue wants a stricter citation (full
 * author list, volume/issue/pages, DOI) it can add an optional `citation`
 * block; everything here falls back to the display strings when it is absent.
 */

export interface CitationAuthor {
  family: string;
  given: string;
}

const IN_PRESS_PATTERN = /\s*\((?:in press|accepted|forthcoming)\)\s*$/i;

const BIBTEX_STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'for',
  'on',
  'in',
  'to',
  'toward',
  'towards',
  'with',
  'using',
  'and',
  'from',
  'at',
  'by',
  'as',
  'is',
  'are',
  'via',
]);

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slug(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Best-effort split of a "Given Family" display name. */
function splitDisplayName(name: string): CitationAuthor {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { family: parts[0] ?? '', given: '' };
  return {
    family: parts[parts.length - 1],
    given: parts.slice(0, -1).join(' '),
  };
}

/**
 * Authors for citations. `citation.authors` is family-first and
 * semicolon-separated (`"Guo, Yanan; Gil Pérez, Marta"`); the display string
 * is "Given Family, Given Family" and is only split heuristically.
 */
export function citationAuthors(pub: Publication): CitationAuthor[] {
  const raw = (pub.citation?.authors ?? pub.authors ?? '').trim();
  if (!raw) return [];

  if (raw.includes(';')) {
    return raw
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const comma = entry.indexOf(',');
        if (comma === -1) return splitDisplayName(entry);
        return {
          family: entry.slice(0, comma).trim(),
          given: entry.slice(comma + 1).trim(),
        };
      })
      .filter((author) => author.family.length > 0);
  }

  return raw.split(',').map(splitDisplayName).filter((author) => author.family.length > 0);
}

/** Venue without the "(in press)" style suffix, which becomes a note instead. */
export function citationVenue(pub: Publication): string {
  const venue = (pub.citation?.venue ?? pub.venue ?? '').trim();
  return venue.replace(IN_PRESS_PATTERN, '').trim();
}

export function citationNote(pub: Publication): string | undefined {
  if (pub.citation?.note) return pub.citation.note;
  const match = (pub.venue ?? '').match(IN_PRESS_PATTERN);
  return match ? 'In press' : undefined;
}

function doiFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i);
  return match ? match[1].replace(/\/+$/, '') : undefined;
}

export function citationDoi(pub: Publication): string | undefined {
  const explicit = pub.citation?.doi?.trim();
  if (explicit) return explicit.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
  return doiFromUrl(pub.url);
}

/** Canonical link: DOI resolver when available, otherwise the source URL. */
export function citationSourceUrl(pub: Publication): string | undefined {
  const doi = citationDoi(pub);
  if (doi) return `https://doi.org/${doi}`;
  return pub.url?.trim() || undefined;
}

function formatInitials(given: string): string {
  return given
    .split(/[\s.-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** Vancouver keeps the first six authors, then "et al." */
export function formatVancouverAuthors(authors: CitationAuthor[], max = 6): string {
  if (!authors.length) return '';
  const shown = authors
    .slice(0, max)
    .map(({ family, given }) => [family, formatInitials(given)].filter(Boolean).join(' '));
  return authors.length > max ? `${shown.join(', ')}, et al.` : shown.join(', ');
}

function endSentence(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /[.?!]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Vancouver style:
 * `Guo Y, Gil Pérez M, Knippers J. Structural design with uncertainties of
 * coreless filament wound structures. Structures. 2025;82:110411.
 * doi:10.1016/j.istruc.2025.110411`
 */
export function toVancouver(pub: Publication): string {
  const authors = formatVancouverAuthors(citationAuthors(pub));
  const venue = endSentence(citationVenue(pub));
  const note = citationNote(pub);
  const doi = citationDoi(pub);
  const { volume, issue, pages } = pub.citation ?? {};

  let locator = endSentence(pub.year ?? '');
  if (note) {
    locator = endSentence(note);
  } else if (volume) {
    locator = endSentence(
      `${pub.year};${volume}${issue ? `(${issue})` : ''}${pages ? `:${pages}` : ''}`
    );
  } else if (pages) {
    locator = endSentence(`${pub.year}:${pages}`);
  }

  return [
    authors ? endSentence(authors) : '',
    endSentence(pub.title),
    venue,
    locator,
    doi ? `doi:${doi}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\.\s*\./g, '.');
}

function bibtexEntryType(pub: Publication): string {
  if (pub.group === 'theses' || /(doctoral|master's|bachelor's)\s+(dissertation|thesis)/i.test(pub.venue ?? '')) {
    return /doctoral|phd|dissertation/i.test(pub.venue ?? '') ? 'phdthesis' : 'mastersthesis';
  }
  switch (pub.type) {
    case 'journal':
      return 'article';
    case 'conference':
    case 'workshop':
      return 'inproceedings';
    case 'book-chapter':
      return 'incollection';
    default:
      return 'misc';
  }
}

function escapeBibtex(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_');
}

/** `guo2025structural`: first author family + year + first significant title word. */
export function bibtexKey(pub: Publication): string {
  const first = citationAuthors(pub)[0];
  const family = first ? slug(first.family) : 'anon';
  const year = (pub.year ?? '').match(/\d{4}/)?.[0] ?? 'nd';
  const word =
    (pub.title ?? '')
      .split(/[\s:;–—,]+/)
      .map((token) => token.replace(/[^A-Za-z0-9]/g, ''))
      .filter(Boolean)
      .find((token) => !BIBTEX_STOPWORDS.has(token.toLowerCase())) ?? 'untitled';
  return `${family}${year}${slug(word)}`;
}

/** School name for `@phdthesis` / `@mastersthesis`: the part after the degree. */
function thesisSchool(pub: Publication): string {
  const venue = citationVenue(pub);
  const comma = venue.indexOf(',');
  return (comma === -1 ? venue : venue.slice(comma + 1)).trim();
}

/**
 * BibTeX entry, ready to paste into a .bib file:
 * `@article{guo2025structural, author = {...}, ...}`
 */
export function toBibtex(pub: Publication): string {
  const entryType = bibtexEntryType(pub);
  const authors = citationAuthors(pub)
    .map(({ family, given }) => (given ? `${family}, ${given}` : family))
    .join(' and ');
  const doi = citationDoi(pub);
  const url = citationSourceUrl(pub);
  const note = citationNote(pub);
  const { volume, issue, pages } = pub.citation ?? {};

  const fields: Array<[string, string]> = [];
  if (authors) fields.push(['author', authors]);
  // Inner braces keep the original capitalisation of the title in BibTeX.
  fields.push(['title', `{${escapeBibtex(pub.title)}}`]);

  if (entryType === 'article') {
    fields.push(['journal', escapeBibtex(citationVenue(pub))]);
  } else if (entryType === 'inproceedings' || entryType === 'incollection') {
    fields.push(['booktitle', escapeBibtex(citationVenue(pub))]);
  } else if (entryType === 'phdthesis' || entryType === 'mastersthesis') {
    fields.push(['school', escapeBibtex(thesisSchool(pub))]);
  }

  fields.push(['year', pub.year]);
  if (volume) fields.push(['volume', volume]);
  if (issue) fields.push(['number', issue]);
  if (pages) fields.push(['pages', pages.replace(/\s*[-–]\s*/g, '--')]);
  if (note) fields.push(['note', escapeBibtex(note)]);
  if (doi) fields.push(['doi', doi]);
  if (entryType === 'misc') {
    if (url) fields.push(['howpublished', `\\url{${url}}`]);
  } else if (url) {
    fields.push(['url', url]);
  }

  const width = Math.max(...fields.map(([name]) => name.length));
  const body = fields
    .map(([name, value]) => `  ${name.padEnd(width)} = {${value}}`)
    .join(',\n');

  return `@${entryType}{${bibtexKey(pub)},\n${body}\n}`;
}
