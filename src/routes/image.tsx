import type { APIEvent } from "@solidjs/start/server";
import * as v from "valibot";
import { type IconColors, parseColors } from "~/context/iconColors";
import { convertFromSvg } from "~/lib/image";
import { useQuery } from "~/lib/query";
import { retry } from "~/lib/retry";
import { ssrSvgStr } from "~/lib/ssrSvgStr";

const MAX_SIZE = 1024;

const imageQuerySchema = v.object({
  p: v.optional(v.string()),
  f: v.optional(v.union([v.literal("png"), v.literal("svg")]), "svg"),
  s: v.optional(
    v.pipe(
      v.string(),
      v.regex(/^(\d+)(x(\d+))?$/),
      v.transform((s) => {
        const match = s.match(/^(\d+)(x(\d+))?$/);
        if (!match) {
          throw new Error("invalid size");
        }
        const [_, w, __, h] = match;
        return { w: Number.parseInt(w), h: h ? Number.parseInt(h) : undefined };
      }),
      v.check((s) => {
        if (s.w === 0 || s.h === 0) {
          return false;
        }
        if (s.w > MAX_SIZE || (s.h && s.h > MAX_SIZE)) {
          return false;
        }
        return true;
      }, "invalid size"),
    ),
  ),
});
export type ImageQueryOutput = v.InferOutput<typeof imageQuerySchema>;

const cache = "public, max-age=31536000";

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

  const svgText = await retry(() => ssrSvgStr(params), {
    retries: 2,
    delay: 100,
  });

  switch (query.output.f) {
    case "svg":
      return new Response(svgText, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": cache,
        },
      });
    case "png": {
      const png = await convertFromSvg(svgText, "png", {
        size: query.output.s,
        square: true,
      });
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
