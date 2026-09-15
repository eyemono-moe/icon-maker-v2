import type { APIEvent } from "@solidjs/start/server";
import { createImageResponse } from "~/image/image-response";
import { runtimePngEncoder } from "~/image/runtime-png-encoder";

export async function GET(event: APIEvent) {
  return createImageResponse(event.request, runtimePngEncoder, {
    format: "png",
    renderer: { variant: "ogp" },
  });
}
