import { type Context } from 'jsr:@hono/hono';
import { getErrorMessage, getErrorStatus } from '../utils/errors.ts';

export function toErrorResponse(error: Error, context: Context) {
  const status = getErrorStatus(error);

  console.error(error);

  return context.json(
    {
      error: {
        message: getErrorMessage(error),
      },
    },
    status
  );
}
