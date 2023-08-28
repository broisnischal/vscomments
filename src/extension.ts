import * as vscode from "vscode";

class Comment {
  constructor(
    public text: string,
    public line: number,
    public indentLevel: number,
    public isExpanded: boolean = false
  ) {}
}

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
      let indentLevel = 0;

      for (let line = 0; line < document.lineCount; line++) {
        const text = document.lineAt(line).text;

        if (text.includes("/*")) {
          indentLevel++;
        }

        if (text.includes("*/")) {
          indentLevel--;
        }

        if (indentLevel === 0 && text.includes("//") && text.trim().replace("//", "")) {
          this._comments.push(new Comment(text, line, indentLevel));
        }
      }
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
      tooltip: element.text,
      description: element.text.trim().slice(0, 50).replace("//", ""),
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

export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor;

  console.log('Congratulations, your extension "learning" is now active!');
  let treeDataProvider = new CommentTreeDataProvider();

  const treeView = vscode.window.createTreeView("comments", {
    treeDataProvider,
  });

  //   let disposable2 = vscode.commands.registerCommand("comments.refreshComments", () => {});

  context.subscriptions.push(treeView);

  context.subscriptions.push(
    vscode.commands.registerCommand("comments.navigateToLine", (line: number) => {
      // vscode.window.showTextDocument(vscode.Uri.parse(`file:///${line}`));
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        // editor.selection = new vscode.Selection(new vscode.Position(line, 0), new vscode.Position(line, 0));
        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
      }
    })
  );

  //   vscode.window.onDidChangeActiveTextEditor((editor) => {
  //     treeDataProvider.loadComments();
  //     // treeView.
  //   });

  context.subscriptions.push(
    vscode.commands.registerCommand("comments.refresh", () => {
      treeDataProvider = new CommentTreeDataProvider();
      treeDataProvider.refresh();
      //   treeView.title = `Comments reloaded`;
      //   setTimeout(() => {
      // treeView.message = "";
      //   }, 3000);
    })
  );

  const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document === vscode.window.activeTextEditor?.document) {
      treeDataProvider.refresh();
      treeView.message = `Saving, Loading Comments...`;
      setTimeout(() => {
        treeView.message = "";
      }, 3000);
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

  context.subscriptions.push(
    vscode.commands.registerCommand("viewComments", () => {
      const viewPanel = vscode.window.createWebviewPanel(
        "comments",
        "Comments",
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      viewPanel.title = "All comments";

      const thisFileTexts = vscode.window.activeTextEditor?.document.getText();
      const thisFileLines = thisFileTexts?.split("\n");
      const thisFileComments: Comment[] = [];
      thisFileLines?.forEach((line, index) => {
        if (line.includes("/*")) {
          thisFileComments.push(new Comment(line, index, 0));
        }
      });

      viewPanel.webview.html = `
		<html>
		<body>
		${thisFileTexts}
			${thisFileComments.map((comment) => {
        return `<p>${comment.text}</p>`;
      })}
		</body>
		</html>
	  `;
    })
  );

  context.subscriptions.push(saveDisposable);
}

export function deactivate() {}
