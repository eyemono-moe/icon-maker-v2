import type { APIEvent } from "@solidjs/start/server";
import { type Input, literal, object, optional, string, union } from "valibot";
import { type IconParams, parseParams } from "~/context/icon";
import { convertFromSvg } from "~/lib/image";
import { useQuery } from "~/lib/query";
import { retry } from "~/lib/retry";
import { ssrOgpSvgStr } from "~/lib/ssrSvgStr";

const imageQuerySchema = object({
  p: optional(string()),
  f: optional(union([literal("png"), literal("svg")]), "svg"),
});
export type ImageQuery = Input<typeof imageQuerySchema>;

export async function GET(event: APIEvent) {
  const query = useQuery(imageQuerySchema, event.nativeEvent);
  let params: IconParams | undefined;
  if (query.p) {
    params = parseParams(query.p);
  }

  const svgText = await retry(() => ssrOgpSvgStr(params), {
    retries: 2,
    delay: 100,
  });

  const png = await convertFromSvg(svgText, "png");
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
