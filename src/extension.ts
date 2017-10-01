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
  const disposable = vscode.commands.registerCommand(
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
      console.log('current file contents', activeEditorContents);

      try {
        svgo.optimize(activeEditorContents, ({ data }) => {
          // Replace entire active editor contents
          console.log('optimisation result', data);
          replaceSelection(
            vscode.window.activeTextEditor,
            getFullDocumentRange(vscode.window.activeTextEditor.document),
            data,
          );
        });
      } catch (e) {
        console.log(e);
        vscode.window.showErrorMessage(e.toString());
      }
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
