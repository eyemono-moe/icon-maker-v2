import { type BaseIssue, type BaseSchema, parse } from "valibot";
import { type HTTPEvent, getQuery } from "vinxi/http";

export const useQuery = <TInput, TOutput, TIssue extends BaseIssue<unknown>>(
  schema: BaseSchema<TInput, TOutput, TIssue>,
  event: HTTPEvent,
) => {
  const query = getQuery(event);

  try {
    return parse(schema, query);
  } catch (e) {
    throw new Error(`failed to parse query: ${e}`);
  }
};
