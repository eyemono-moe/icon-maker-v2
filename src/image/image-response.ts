import * as v from "valibot";
import type { IconState } from "../domain/icon-state";
import { decodeIconState } from "../domain/icon-state-codec";
import { cache } from "../lib/constants";
import { imageQuerySchema } from "../lib/imageQuerySchema";
import { retry } from "../lib/retry";
import type { PngDimensions, PngEncoder } from "./png-encoder";
import { type SvgRenderOptions, renderIconSvg } from "./render-svg";

type ImageFormat = "png" | "svg";

export type ImageResponseOptions = {
  format?: ImageFormat;
  renderer?: SvgRenderOptions;
};

const badRequest = () => new Response("bad request", { status: 400 });

const getImageFormat = (
  pathname: string,
  queryFormat: ImageFormat,
  explicitFormat?: ImageFormat,
): ImageFormat => {
  if (explicitFormat) return explicitFormat;
  const pathFormat = pathname.match(/^\/image\.(png|svg)/)?.[1];
  return (pathFormat as ImageFormat | undefined) ?? queryFormat;
};

const getState = (encoded: string | undefined): IconState | undefined => {
  if (!encoded) return undefined;
  const result = decodeIconState(encoded);
  return result.ok ? result.value : undefined;
};

export async function createImageResponse(
  request: Request,
  encoder: PngEncoder,
  options: ImageResponseOptions = {},
): Promise<Response> {
  const url = new URL(request.url);
  if (["f", "p", "s"].some((key) => url.searchParams.getAll(key).length > 1)) {
    return badRequest();
  }
  const rawQuery = Object.fromEntries(url.searchParams.entries());
  const isOgp = options.renderer?.variant === "ogp" || url.pathname === "/ogp";
  const queryInput = isOgp ? { p: rawQuery.p, f: rawQuery.f } : rawQuery;
  const parsed = v.safeParse(imageQuerySchema, queryInput);
  if (!parsed.success) return badRequest();

  const state = rawQuery.p ? getState(rawQuery.p) : undefined;
  if (rawQuery.p && !state) return badRequest();

  const format = isOgp
    ? "png"
    : getImageFormat(url.pathname, parsed.output.f, options.format);
  const renderer = isOgp
    ? { ...options.renderer, variant: "ogp" as const }
    : options.renderer;
  const svg = await retry(() => renderIconSvg(state, renderer), {
    retries: 2,
    delay: 100,
  });

  if (format === "svg") {
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": cache,
      },
    });
  }

  const dimensions: PngDimensions = isOgp
    ? { w: 1000, h: 525 }
    : {
        w: parsed.output.s?.w ?? 400,
        h: parsed.output.s?.h ?? parsed.output.s?.w ?? 400,
        square: true,
      };
  const png = await encoder.encode(svg, dimensions);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": cache,
    },
  });
}
