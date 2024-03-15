import type { APIEvent } from "@solidjs/start/server";
import { type Input, literal, object, optional, string, union } from "valibot";
import { type IconParams, parseParams } from "~/context/icon";
import { convertFromSvg } from "~/lib/image";
import { useQuery } from "~/lib/query";
import { ssrSvgStr } from "~/lib/ssrSvgStr";

const imageQuerySchema = object({
  p: optional(string()),
  f: optional(union([literal("png"), literal("svg")]), "svg"),
});
export type ImageQuery = Input<typeof imageQuerySchema>;

export async function GET(event: APIEvent) {
  const query = useQuery(event, imageQuerySchema);
  let params: IconParams | undefined;
  if (query.p) {
    params = parseParams(query.p);
  }

  const svgText = ssrSvgStr(params);

  switch (query.f) {
    case "svg":
      return new Response(svgText, {
        headers: {
          "Content-Type": "image/svg+xml",
        },
      });
    case "png": {
      const png = await convertFromSvg(svgText, "png");
      return new Response(png, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    }
    default:
      return new Response("not implemented", {
        status: 501,
      });
  }
}
