import type { APIEvent } from "@solidjs/start/server";
import * as v from "valibot";
import { type IconColors, parseColors } from "~/context/iconColors";
import { convertFromSvg } from "~/lib/image";
import { useQuery } from "~/lib/query";
import { retry } from "~/lib/retry";
import { ssrOgpSvgStr } from "~/lib/ssrSvgStr";

const imageQuerySchema = v.object({
  p: v.optional(v.string()),
  f: v.optional(v.union([v.literal("png"), v.literal("svg")]), "svg"),
});
export type ImageQuery = v.InferInput<typeof imageQuerySchema>;

export async function GET(event: APIEvent) {
  const query = useQuery(imageQuerySchema, event.nativeEvent);
  if (!query.success) {
    return new Response("bad request", {
      status: 400,
    });
  }

  let params: IconColors | undefined;
  if (query.output.p) {
    params = parseColors(query.output.p);
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
