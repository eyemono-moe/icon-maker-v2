import type { APIEvent } from "@solidjs/start/server";
import { createIdenticonResponse } from "~/image/identicon-response";
import { sharpPngEncoder } from "~/image/sharp-png-encoder";

export async function GET(event: APIEvent) {
  return createIdenticonResponse(event.request, sharpPngEncoder);
}
