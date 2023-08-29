import * as vscode from "vscode";
import Comment from "./Comment";
import CommentTreeDataProvider from "./commentTreeDataProvider";

export default class CommentTreeView {
  constructor(
    treeView: vscode.TreeView<Comment>,
    treeDataProvider: CommentTreeDataProvider,
    context: vscode.ExtensionContext
  ) {
    treeView.onDidExpandElement((event) => {
      if (event.element) {
        event.element.isExpanded = true;
        treeDataProvider.refresh();
      }
    });

    treeView.onDidCollapseElement((event) => {
      if (event.element) {
        event.element.isExpanded = false;
        treeDataProvider.refresh();
      }
    });

    context.subscriptions.push(
      vscode.commands.registerCommand("comments.navigateToLine", (line: number) => {
        // vscode.window.showTextDocument(vscode.Uri.parse(`file:///${line}`));
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          editor.selection = new vscode.Selection(
            new vscode.Position(line, 0),
            new vscode.Position(line, 0)
          );
          editor.revealRange(
            new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0))
          );
        }
      })
    );
  }
}
