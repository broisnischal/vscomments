import * as vscode from "vscode";
import Comment from "./Comment";
import { activate } from "./extension";
import CommentLoader from "./CommentLoader";

class CommentTreeDataProvider implements vscode.TreeDataProvider<Comment> {
  private _comments: Comment[] = [];
  private _onDidChangeTreeData: vscode.EventEmitter<Comment | undefined> = new vscode.EventEmitter<
    Comment | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<Comment | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    this.loadComments();
  }

  public loadComments() {
    this._comments = [];
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      this._comments = CommentLoader.loadComments(document);
    }
  }

  getTreeItem(element: Comment): vscode.TreeItem | Thenable<vscode.TreeItem> {
    const collapsibleState =
      element.indentLevel > 0
        ? element.isExpanded
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None;

    return {
      //   label: `${element.line + 1} : `,
      accessibilityInformation: {
        label: `${element.line + 1} : `,
      },
      tooltip: element.text,
      description: element.text.trim().slice(0, 30).replace("//", "") + "...",
      collapsibleState: collapsibleState,
      command: {
        command: "comments.navigateToLine",
        title: `Go to Line ${element.line + 1}`,
        arguments: [element.line],
      },
    };
  }
  getChildren(element?: Comment): Thenable<Comment[]> {
    if (!element) {
      return Promise.resolve(this._comments.filter((c) => c.indentLevel === 0));
    }

    if (element.isExpanded) {
      const expandedComments = this._comments.filter(
        (comment) => comment.indentLevel === element.indentLevel + 1
      );
      return Promise.resolve(expandedComments);
    }
    return Promise.resolve([]);
  }

  refresh(): void {
    // this._comments = [];
    this.loadComments();
    this._onDidChangeTreeData.fire(undefined);
  }
}

export default CommentTreeDataProvider;
