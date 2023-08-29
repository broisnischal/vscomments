import * as vscode from "vscode";
import CommentTreeDataProvider from "./commentTreeDataProvider";
import Comment from "./Comment";
import CommentTreeView from "./CommentTreeView";
import { viewComment } from "./ViewComment";

export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor;
  let treeDataProvider = new CommentTreeDataProvider();

  const treeView = vscode.window.createTreeView("comments", {
    treeDataProvider,
  });

  context.subscriptions.push(treeView);

  new CommentTreeView(treeView, treeDataProvider, context);

  context.subscriptions.push(
    vscode.commands.registerCommand("comments.refresh", () => {
      treeDataProvider = new CommentTreeDataProvider();
      treeDataProvider.refresh();
    })
  );

  const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document === vscode.window.activeTextEditor?.document) {
      treeDataProvider.refresh();
    }
  });

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === activeEditor?.document) {
        treeDataProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      if (editor) {
        treeDataProvider.refresh();
      }
    })
  );
  context.subscriptions.push(vscode.commands.registerCommand("viewComments", viewComment));
  context.subscriptions.push(saveDisposable);
}

export function deactivate() {}
