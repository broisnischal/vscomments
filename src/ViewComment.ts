import * as vscode from "vscode";
import Comment from "./Comment";
import CommentTreeDataProvider from "./commentTreeDataProvider";
import CommentLoader from "./CommentLoader";
export function viewComment() {
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

  if (vscode.window.activeTextEditor) {
    const comments = CommentLoader.loadComments(vscode.window.activeTextEditor.document);

    console.log(comments);

    viewPanel.webview.html = `
        <html>
        <head>
          <style>
          </style>
        </head>
        <body>
            ${comments.map((comment) => {
              `
               ${comment.text.replace("//", "").trim()}
              `;
            })}
        </body>
        </html>
      `;
  }
}
