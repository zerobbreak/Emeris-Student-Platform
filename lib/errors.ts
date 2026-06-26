export class ActionError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ActionError";
  }
}
