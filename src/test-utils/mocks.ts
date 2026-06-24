import { Request, Response } from 'express';

interface RecordedResponse {
  statusCode?: number;
  body?: unknown;
}

/**
 * Minimal Express Response double that records the last `status()` code and
 * `json()` payload. Both methods are chainable like the real Response.
 */
export const createMockResponse = () => {
  const recorded: RecordedResponse = {};

  const res = {
    status(code: number) {
      recorded.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      recorded.body = payload;
      return res;
    },
  };

  return { res: res as unknown as Response, recorded };
};

/** Builds a partial Express Request from a plain object. */
export const createMockRequest = <Req extends Request = Request>(
  overrides: Partial<Req> = {}
): Req => overrides as unknown as Req;
