import type { APIEvent } from "@solidjs/start/server";
import { type BaseSchema, parse } from "valibot";
import { getQuery } from "vinxi/http";

export const useQuery = <T>(event: APIEvent, schema: BaseSchema<T>) => {
  const query = getQuery(event.nativeEvent);

  try {
    return parse(schema, query);
  } catch (e) {
    throw new Error(`failed to parse query: ${e}`);
  }
};
