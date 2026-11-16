import { describe, expect, it } from 'vitest';
import {
  bulletList,
  codeBlock,
  doc,
  em,
  expand,
  h2,
  link,
  mention,
  orderedList,
  p,
  panel,
  status,
  strong,
  tableFrom,
  validate,
} from '@ai-testing-tool/atlassian-adf-lite';
import { adfToDelta } from '../src/convert/adfToDelta';
import { deltaToAdf } from '../src/convert/deltaToAdf';

describe('adf ↔ delta round-trip', () => {
  it('round-trips paragraphs, marks, headings, lists, code', () => {
    const input = doc(
      h2('Release notes'),
      p('Hello ', strong(em('world')), ' — ', link('https://example.com', 'docs'), '.'),
      bulletList('alpha', 'beta'),
      orderedList('one', 'two'),
      codeBlock('npm test', 'bash'),
    );

    const delta = adfToDelta(input);
    const output = deltaToAdf(delta, { validate: false });
    const { valid, errors } = validate(output, { strictTypes: false });
    expect(valid, JSON.stringify(errors)).toBe(true);
    expect(output.type).toBe('doc');
    expect(output.content.some((n) => n.type === 'heading')).toBe(true);
    expect(output.content.some((n) => n.type === 'bulletList')).toBe(true);
    expect(output.content.some((n) => n.type === 'orderedList')).toBe(true);
    expect(output.content.some((n) => n.type === 'codeBlock')).toBe(true);
  });

  it('round-trips mentions and status', () => {
    const input = doc(
      p('Hi ', mention('abc', 'Ana'), ' status ', status('Done', 'green')),
    );
    const output = deltaToAdf(adfToDelta(input), { validate: false });
    const text = JSON.stringify(output);
    expect(text).toContain('"type":"mention"');
    expect(text).toContain('"type":"status"');
    expect(validate(output).valid).toBe(true);
  });

  it('round-trips panel, expand, and table', () => {
    const input = doc(
      panel('warning', 'Tokens revoked.'),
      expand('Migration', p('Nothing to do.')),
      tableFrom(['Metric', 'Value'], [['p95', '180']]),
    );
    const output = deltaToAdf(adfToDelta(input), { validate: false });
    expect(output.content.some((n) => n.type === 'panel')).toBe(true);
    expect(output.content.some((n) => n.type === 'expand')).toBe(true);
    expect(output.content.some((n) => n.type === 'table')).toBe(true);
    expect(validate(output, { strictTypes: false }).valid).toBe(true);
  });

  it('handles empty docs', () => {
    const output = deltaToAdf(adfToDelta(doc()), { validate: false });
    expect(output.type).toBe('doc');
    expect(output.content.length).toBeGreaterThan(0);
  });
});
