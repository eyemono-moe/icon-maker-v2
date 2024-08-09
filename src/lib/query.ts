import * as v from "valibot";
import { type HTTPEvent, getQuery } from "vinxi/http";

export const useQuery = <TInput, TOutput, TIssue extends v.BaseIssue<unknown>>(
  schema: v.BaseSchema<TInput, TOutput, TIssue>,
  event: HTTPEvent,
) => {
  const query = getQuery(event);
  return v.safeParse(schema, query);
};
