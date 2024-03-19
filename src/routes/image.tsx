import type { APIEvent } from "@solidjs/start/server";
import { type Input, literal, object, optional, string, union } from "valibot";
import { type IconColors, parseColors } from "~/context/iconColors";
import { convertFromSvg } from "~/lib/image";
import { useQuery } from "~/lib/query";
import { retry } from "~/lib/retry";
import { ssrSvgStr } from "~/lib/ssrSvgStr";

const imageQuerySchema = object({
  p: optional(string()),
  f: optional(union([literal("png"), literal("svg")]), "svg"),
});
export type ImageQuery = Input<typeof imageQuerySchema>;

const cache = "public, max-age=31536000";

export async function GET(event: APIEvent) {
  const query = useQuery(imageQuerySchema, event.nativeEvent);
  let params: IconColors | undefined;
  if (query.p) {
    params = parseColors(query.p);
  }

  const svgText = await retry(() => ssrSvgStr(params), {
    retries: 2,
    delay: 100,
  });

  switch (query.f) {
    case "svg":
      return new Response(svgText, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": cache,
        },
      });
    case "png": {
      const png = await convertFromSvg(svgText, "png");
      return new Response(png, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": cache,
        },
      });
    }
    default:
      return new Response("not implemented", {
        status: 501,
      });
  }
}
