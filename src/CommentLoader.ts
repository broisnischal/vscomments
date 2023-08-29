import * as vscode from "vscode";
import Comment from "./Comment";

export default class CommentLoader {
  static loadComments(document: vscode.TextDocument): Comment[] {
    const comments: Comment[] = [];

    let indentLevel = 0;
    const fileExtension = document.fileName.split(".").pop();

    for (let line = 0; line < document.lineCount; line++) {
      const text = document.lineAt(line).text;

      if (fileExtension === "js" || fileExtension === "ts") {
        if (text.includes("/*")) {
          indentLevel++;
        }

        if (text.includes("*/")) {
          indentLevel--;
        }

        if (indentLevel === 0 && text.includes("//") && text.trim().replace("//", "")) {
          const groupedComments: string[] = [text];
          let nextLine = line + 1;

          while (nextLine < document.lineCount) {
            const nextLineText = document.lineAt(nextLine).text;
            if (nextLineText.trim().startsWith("//")) {
              groupedComments.push(nextLineText);
              nextLine++;
            } else {
              break;
            }
          }

          comments.push(new Comment(groupedComments.join("\n"), line, indentLevel));
          line = nextLine - 1;
        }
      } else if (fileExtension === "py") {
        if (text.includes("'''")) {
          indentLevel++;
        }

        if (text.includes("'''")) {
          indentLevel--;
        }

        if (indentLevel === 0 && text.includes("#") && text.trim().replace("#", "")) {
          comments.push(new Comment(text, line, indentLevel));
        }
      }
    }
    return comments;
  }
}
