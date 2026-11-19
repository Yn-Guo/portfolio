import { describe, expect, it } from 'vitest';
import type { Publication } from '@/portfolio.config';
import {
  bibtexKey,
  citationAuthors,
  citationDoi,
  citationSourceUrl,
  toBibtex,
  toVancouver,
} from '@/lib/citations';

const journalPaper: Publication = {
  title: 'Structural design with uncertainties of coreless filament wound structures',
  authors: 'Yanan Guo, Marta Gil Pérez, Jan Knippers',
  venue: 'Structures',
  year: '2025',
  url: 'https://doi.org/10.1016/j.istruc.2025.110411',
  type: 'journal',
  tags: [],
  citation: {
    doi: '10.1016/j.istruc.2025.110411',
    volume: '82',
    pages: '110411',
    authors: 'Guo, Yanan; Gil Pérez, Marta; Knippers, Jan',
  },
};

const conferencePaper: Publication = {
  title: 'Towards Physics-Informed Machine Learning in Structural Design',
  authors: 'Yanan Guo, Marta Gil Pérez',
  venue: 'Proceedings of the IASS 2026 Symposium (in press)',
  year: '2026',
  url: '',
  type: 'conference',
  tags: [],
  citation: { authors: 'Guo, Yanan; Gil Pérez, Marta' },
};

const thesis: Publication = {
  title:
    'Implementation of Finite Element simulation in the structural design of coreless filament-wound component',
  authors: 'Yanan Guo',
  venue: 'Doctoral dissertation, University of Stuttgart',
  year: '2025',
  url: '',
  type: '',
  group: 'theses',
  tags: [],
};

describe('citationAuthors', () => {
  it('reads the family-first citation list when present', () => {
    expect(citationAuthors(journalPaper)).toEqual([
      { family: 'Guo', given: 'Yanan' },
      { family: 'Gil Pérez', given: 'Marta' },
      { family: 'Knippers', given: 'Jan' },
    ]);
  });

  it('falls back to the display author string', () => {
    expect(citationAuthors(thesis)).toEqual([{ family: 'Guo', given: 'Yanan' }]);
  });
});

describe('citationDoi', () => {
  it('prefers the explicit doi over the url', () => {
    expect(citationDoi(journalPaper)).toBe('10.1016/j.istruc.2025.110411');
  });

  it('derives the doi from a doi.org url', () => {
    const withoutExplicitDoi: Publication = {
      ...journalPaper,
      citation: { volume: '82', authors: 'Guo, Yanan' },
    };
    expect(citationDoi(withoutExplicitDoi)).toBe('10.1016/j.istruc.2025.110411');
    expect(citationSourceUrl(withoutExplicitDoi)).toBe(
      'https://doi.org/10.1016/j.istruc.2025.110411'
    );
  });

  it('falls back to the source url when there is no doi', () => {
    expect(citationDoi(conferencePaper)).toBeUndefined();
    expect(citationSourceUrl(conferencePaper)).toBeUndefined();
  });
});

describe('bibtexKey', () => {
  it('combines the first author, the year and the first significant word', () => {
    expect(bibtexKey(journalPaper)).toBe('guo2025structural');
    expect(bibtexKey(conferencePaper)).toBe('guo2026physicsinformed');
  });
});

describe('toBibtex', () => {
  it('renders a journal article with volume, pages and doi', () => {
    const bibtex = toBibtex(journalPaper);
    expect(bibtex).toContain('@article{guo2025structural,');
    expect(bibtex).toMatch(
      /author\s+= \{Guo, Yanan and Gil Pérez, Marta and Knippers, Jan\}/
    );
    expect(bibtex).toMatch(/journal\s+= \{Structures\}/);
    expect(bibtex).toMatch(/volume\s+= \{82\}/);
    expect(bibtex).toMatch(/pages\s+= \{110411\}/);
    expect(bibtex).toMatch(/doi\s+= \{10\.1016\/j\.istruc\.2025\.110411\}/);
  });

  it('turns "(in press)" into a note and a proceedings entry', () => {
    const bibtex = toBibtex(conferencePaper);
    expect(bibtex).toContain('@inproceedings{guo2026physicsinformed,');
    expect(bibtex).toMatch(/booktitle\s+= \{Proceedings of the IASS 2026 Symposium\}/);
    expect(bibtex).toMatch(/note\s+= \{In press\}/);
    expect(bibtex).not.toContain('(in press)');
  });

  it('renders a doctoral thesis with its school', () => {
    const bibtex = toBibtex(thesis);
    expect(bibtex).toContain('@phdthesis{guo2025implementation,');
    expect(bibtex).toMatch(/school\s+= \{University of Stuttgart\}/);
  });
});

describe('toVancouver', () => {
  it('renders authors, title, journal, year;volume:pages and doi', () => {
    expect(toVancouver(journalPaper)).toBe(
      'Guo Y, Gil Pérez M, Knippers J. Structural design with uncertainties of coreless filament wound structures. Structures. 2025;82:110411. doi:10.1016/j.istruc.2025.110411'
    );
  });

  it('uses "In press" instead of a volume for accepted papers', () => {
    expect(toVancouver(conferencePaper)).toBe(
      'Guo Y, Gil Pérez M. Towards Physics-Informed Machine Learning in Structural Design. Proceedings of the IASS 2026 Symposium. In press.'
    );
  });

  it('truncates long author lists after six names', () => {
    const manyAuthors: Publication = {
      ...journalPaper,
      citation: {
        ...journalPaper.citation,
        authors: Array.from({ length: 8 }, (_, i) => `Author${i}, Given`).join('; '),
      },
    };
    const vancouver = toVancouver(manyAuthors);
    expect(vancouver).toContain(
      'Author0 G, Author1 G, Author2 G, Author3 G, Author4 G, Author5 G, et al.'
    );
    expect(vancouver).not.toContain('Author6');
  });
});
