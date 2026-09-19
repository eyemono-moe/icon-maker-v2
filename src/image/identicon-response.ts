import * as v from "valibot";
import {
  IDENTICON_VERSIONS,
  type IdenticonVersion,
  createIdenticonState,
  isValidIdenticonSeed,
} from "../domain/identicon";
import { imageQuerySchema } from "../lib/imageQuerySchema";
import { type ImageFormat, renderImageResponse } from "./image-response";
import type { PngEncoder } from "./png-encoder";

const badRequest = () => new Response("bad request", { status: 400 });
const notFound = () => new Response("not found", { status: 404 });

const identiconPathRegex = /^\/identicon\/([^/]+)\/([^/]+)$/;
const formatSuffixRegex = /\.(png|svg)$/;

/** Parses `/identicon/{version}/{seed}[.png|.svg]`. Only a trailing extension is treated as the format. */
export const parseIdenticonPath = (
  pathname: string,
):
  | { ok: true; version: IdenticonVersion; seed: string; format: ImageFormat }
  | { ok: false; status: 400 | 404 } => {
  const match = pathname.match(identiconPathRegex);
  if (!match) return { ok: false, status: 404 };
  const [, version, rawSeed] = match;
  if (!(IDENTICON_VERSIONS as readonly string[]).includes(version)) {
    return { ok: false, status: 404 };
  }

  const format = (rawSeed.match(formatSuffixRegex)?.[1] ??
    "svg") as ImageFormat;
  let seed: string;
  try {
    seed = decodeURIComponent(rawSeed.replace(formatSuffixRegex, ""));
  } catch {
    return { ok: false, status: 400 };
  }
  if (!isValidIdenticonSeed(seed)) return { ok: false, status: 400 };

  return { ok: true, version: version as IdenticonVersion, seed, format };
};

export async function createIdenticonResponse(
  request: Request,
  encoder: PngEncoder,
): Promise<Response> {
  const url = new URL(request.url);
  const path = parseIdenticonPath(url.pathname);
  if (!path.ok) return path.status === 404 ? notFound() : badRequest();

  const sizes = url.searchParams.getAll("s");
  if (sizes.length > 1) return badRequest();
  const parsed = v.safeParse(imageQuerySchema, { s: sizes[0] });
  if (!parsed.success) return badRequest();

  const state = await createIdenticonState(path.seed, path.version);
  return renderImageResponse(state, {
    format: path.format,
    encoder,
    dimensions: {
      w: parsed.output.s?.w ?? 400,
      h: parsed.output.s?.h ?? parsed.output.s?.w ?? 400,
      square: true,
    },
  });
}
