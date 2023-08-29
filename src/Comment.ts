export default class Comment {
  constructor(
    public text: string,
    public line: number,
    public indentLevel: number,
    public isExpanded: boolean = false
  ) {}
}
