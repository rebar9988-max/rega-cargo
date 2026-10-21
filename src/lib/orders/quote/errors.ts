/** Errors of the Bring For Me quote/cart module. `code` is the only thing a client ever sees. */
export type BfmErrorCode =
  | "invalid"
  | "rate"
  | "forbidden"
  | "notfound"
  | "prohibited" // banned product: nothing was added, nothing is shown
  | "conflict" // settings changed by someone else meanwhile
  | "unsafe_url"
  | "limit"
  | "review_pending"
  | "unavailable";

export class BfmError extends Error {
  code: BfmErrorCode;
  detail?: Record<string, unknown>;
  constructor(code: BfmErrorCode, detail?: Record<string, unknown>) {
    super(code);
    this.name = "BfmError";
    this.code = code;
    this.detail = detail;
  }
}
