import { type BaseSchema, parse } from "valibot";
import { type HTTPEvent, getQuery } from "vinxi/http";

export const useQuery = <T>(event: HTTPEvent, schema: BaseSchema<T>) => {
  const query = getQuery(event);

  try {
    return parse(schema, query);
  } catch (e) {
    throw new Error(`failed to parse query: ${e}`);
  }
};
