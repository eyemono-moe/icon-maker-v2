import type { APIEvent } from "@solidjs/start/server";
import type { IconState } from "~/domain/icon-state";
import { decodeIconState } from "~/domain/icon-state-codec";
import { cache } from "~/lib/constants";
import { convertFromSvg } from "~/lib/image";
import { imageQuerySchema } from "~/lib/imageQuerySchema";
import { useQuery } from "~/lib/query";
import { retry } from "~/lib/retry";
import { ssrSvgStr } from "~/lib/ssrSvgStr";

export async function GET(event: APIEvent) {
  const query = useQuery(imageQuerySchema, event.nativeEvent);
  if (!query.success) {
    return new Response("bad request", {
      status: 400,
    });
  }

  let params: IconState | undefined;
  if (query.output.p) {
    const result = decodeIconState(query.output.p);
    if (!result.ok) {
      return new Response("bad request", { status: 400 });
    }
    params = result.value;
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
