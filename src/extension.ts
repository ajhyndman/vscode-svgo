'use strict';
import * as vscode from 'vscode';

import resolveModule from './resolveModule';
import { getFullDocumentRange, replaceSelection } from './utils';

export function activate(context: vscode.ExtensionContext) {
  // Attempt to load the SVGO module.
  let svgo;
  try {
    const SVGO = resolveModule('svgo', vscode.workspace.rootPath);
    svgo = new SVGO();
  } catch (e) {
    // This error will generally be too low level to be useful to users.
    // We log it for debugging purposes, anyway.
    console.log(e);
  }

  // Register VS Code commands.
  const disposable1 = vscode.commands.registerCommand(
    'extension.optimizeActiveFile',
    () => {
      if (svgo == null) {
        vscode.window.showErrorMessage(
          'The svgo package is not available. Please install it locally or globally, and reload VS Code.',
        );
        return;
      }

      // Get active editor contents.
      const activeEditorContents = vscode.window.activeTextEditor.document.getText();

      try {
        svgo.optimize(activeEditorContents, ({ data }) => {
          // Replace entire active editor contents
          replaceSelection(
            vscode.window.activeTextEditor,
            getFullDocumentRange(vscode.window.activeTextEditor.document),
            data,
          );
        });
      } catch (e) {
        vscode.window.showErrorMessage(e.toString());
      }
    },
  );

  const disposable2 = vscode.commands.registerCommand(
    'extension.optimizeSelection',
    () => {
      if (svgo == null) {
        vscode.window.showErrorMessage(
          'The svgo package is not available. Please install it locally or globally, and reload VS Code.',
        );
        return;
      }

      // Iterate over all active selections.
      vscode.window.activeTextEditor.selections.forEach(selection => {
        // Get text in current selection
        const selectedText = vscode.window.activeTextEditor.document.getText(
          selection,
        );

        try {
          svgo.optimize(selectedText, ({ data }) => {
            // Replace selection contents
            replaceSelection(vscode.window.activeTextEditor, selection, data);
          });
        } catch (e) {
          vscode.window.showErrorMessage(e.toString());
        }
      });
    },
  );

  context.subscriptions.push(disposable1, disposable2);
}

export function deactivate() {}
