import { describe, expect, test } from "vitest";
import { createDefaultIconState } from "../domain/icon-state";
import { renderIconSvg } from "./render-svg";

describe("renderIconSvg", () => {
  test("renders the normal icon as an optimized 400px SVG", async () => {
    const svg = await renderIconSvg(createDefaultIconState());

    expect(svg.match(/^<svg [^>]+>/)?.[0]).toMatchInlineSnapshot(
      `"<svg viewBox="0 0 400 400" width="400" height="400" xmlns="http://www.w3.org/2000/svg" fill="none" class="overflow-visible">"`,
    );
    expect(svg.match(/rotate\(0, 230, 310\)/g)).toHaveLength(2);
    expect(svg).toMatchSnapshot();
  });

  test("renders the OGP composition through renderer options", async () => {
    const svg = await renderIconSvg(createDefaultIconState(), {
      variant: "ogp",
    });

    expect(svg).toContain('width="1000"');
    expect(svg).toContain('height="525"');
    expect(svg).toContain('fill="white"');
  });
});
