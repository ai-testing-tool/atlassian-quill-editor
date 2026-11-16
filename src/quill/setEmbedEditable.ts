const EDITABLE_SELECTORS = [
  '.aqe-panel-body',
  '.aqe-expand-title',
  '.aqe-expand-body',
  '.aqe-table th',
  '.aqe-table td',
].join(', ');

/** Quill enable(false) does not lock nested contenteditable regions inside custom embeds. */
export function setEmbedEditable(root: HTMLElement | null | undefined, editable: boolean): void {
  if (!root) return;
  root.querySelectorAll(EDITABLE_SELECTORS).forEach((el) => {
    el.setAttribute('contenteditable', editable ? 'true' : 'false');
  });
}
