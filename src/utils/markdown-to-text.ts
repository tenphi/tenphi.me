/**
 * Convert Markdown/MDX source into a plaintext representation suitable for the
 * `textContent` field of a `site.standard.document` record.
 *
 * Uses remark + strip-markdown so the output contains no formatting, code
 * fences, image syntax, or link URLs — just readable prose. MDX-specific
 * syntax (ESM import/export statements and JSX tags) is stripped first so it
 * never leaks into the plaintext.
 */
import { remark } from 'remark';
import strip from 'strip-markdown';

const processor = remark().use(strip);

/** Remove MDX ESM statements and JSX tags that remark can't parse as prose. */
function stripMdx(source: string): string {
  return source
    .replace(/^\s*(import|export)\s.*$/gm, '')
    .replace(/<\/?[A-Za-z][^>]*>/g, '');
}

export function markdownToText(markdown: string): string {
  const file = processor.processSync(stripMdx(markdown));
  return String(file)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
