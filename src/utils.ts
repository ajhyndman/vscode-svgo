import { Range, TextDocument, TextEdit, TextEditor } from 'vscode';

export function getFullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  return new Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

export function replaceSelection(
  editor: TextEditor,
  range: Range,
  replacement: string,
) {
  const edit = TextEdit.replace(range, replacement);
  editor.edit(editBuilder => {
    editBuilder.replace(range, replacement);
  });
}
