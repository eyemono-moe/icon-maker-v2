import type { APIEvent } from "@solidjs/start/server";
import { createImageResponse } from "~/image/image-response";
import { sharpPngEncoder } from "~/image/sharp-png-encoder";

export async function GET(event: APIEvent) {
  return createImageResponse(event.request, sharpPngEncoder, {
    format: "png",
    renderer: { variant: "ogp" },
  });
}
