import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";
import type { APIEvent } from "@solidjs/start/server";
import { createImageResponse } from "~/image/image-response";
import { sharpPngEncoder } from "~/image/sharp-png-encoder";

const imageRegex = /^image\.(png|svg)$/;

export async function GET(event: APIEvent) {
  const match = event.params["404"].match(imageRegex);
  if (!match) {
    return;
  }
  return createImageResponse(event.request, sharpPngEncoder, {
    format: match[1] as "png" | "svg",
  });
}

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1>Not Found</h1>
      <A href="/">Go Home</A>
    </main>
  );
}
