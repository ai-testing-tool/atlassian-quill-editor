# @ai-testing-tool/atlassian-quill-editor

React + Tailwind Quill editor that round-trips [Atlassian Document Format (ADF)](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/) for Jira Cloud descriptions and comments.

Built on [`@ai-testing-tool/atlassian-adf-lite`](https://www.npmjs.com/package/@ai-testing-tool/atlassian-adf-lite) for types, builders, and validation.

## Install

```bash
npm install @ai-testing-tool/atlassian-quill-editor @ai-testing-tool/atlassian-adf-lite quill react react-dom
```

Import styles once in your app:

```ts
import '@ai-testing-tool/atlassian-quill-editor/styles.css';
```

## Usage

```tsx
import { useState } from 'react';
import { doc, p } from '@ai-testing-tool/atlassian-adf-lite';
import { AdfEditor } from '@ai-testing-tool/atlassian-quill-editor';
import '@ai-testing-tool/atlassian-quill-editor/styles.css';

export function DescriptionField() {
  const [value, setValue] = useState(doc(p('')));

  return (
    <AdfEditor
      value={value}
      onChange={setValue}
      placeholder="Write a description…"
      mention={{
        search: async (q) => users.filter((u) => u.displayName.includes(q)),
      }}
      media={{
        onInsert: async () => ({
          attrs: { type: 'file', id: attachmentId, collection: '' },
          layout: 'center',
        }),
      }}
    />
  );
}
```

Send `value` as the Jira REST v3 `description` / comment `body` field.

### Read-only mode

```tsx
<AdfEditor value={doc} readOnly />
```

This disables Quill editing, locks nested panel/table/expand fields, hides the toolbar (override with `showToolbar`), and suppresses mention UI.

## Converters

Use the converters without the React UI:

```ts
import { adfToDelta, deltaToAdf } from '@ai-testing-tool/atlassian-quill-editor';

const delta = adfToDelta(issue.fields.description);
const doc = deltaToAdf(quill.getContents());
```

## Supported ADF (v1)

| Node / mark | Support |
|-------------|---------|
| `paragraph`, `heading` 1–6 | Editable |
| Text marks: strong, em, strike, underline, code, link, color, background, sub/sup | Editable |
| `bulletList` / `orderedList` (incl. indent) | Editable (deep nesting may flatten) |
| `codeBlock`, `blockquote`, `rule` | Editable |
| `mention`, `status` | Custom embeds |
| `panel`, `expand` | Custom embeds (body as plain text → paragraphs) |
| `table` | Custom embed (cell text editable) |
| `mediaSingle` / `mediaGroup` / `mediaInline` | Placeholder embeds (host supplies upload/URLs) |
| `blockCard` / `embedCard` / unknown | Opaque placeholders (preserved on export) |

## Storybook examples

```bash
npm install
npm run storybook      # http://localhost:6006
npm run build-storybook
```

Stories include:

- **AdfEditor** — empty, Jira description, comment, read-only
- **ADF / Nodes** — one demo per documented node (`blockquote`, `bulletList`, `mention`, `table`, …)
- **ADF / Marks** — one demo per mark (`strong`, `link`, `textColor`, …)

Each story shows the live editor plus emitted ADF JSON.

## Demo

```bash
npm install
npm run dev
```

## Build & release

```bash
npm run build   # → dist ESM + CJS + CSS + types
npm test
npm run release:dry
npm run release   # requires NPM_TOKEN in .env
```

## Known Quill limits

- Deeply nested lists may flatten on round-trip.
- Panel / expand bodies are plain-text (multi-paragraph), not nested rich ADF.
- Media is placeholder-only; binary upload stays in the host app.
- Some ADF-only marks/attrs can be lossy when Quill has no equivalent.
```