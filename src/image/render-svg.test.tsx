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

  test("positions the OGP icon without transform on a nested svg", async () => {
    const svg = await renderIconSvg(createDefaultIconState(), {
      variant: "ogp",
    });
    const nestedSvgTags = svg.match(/<svg\s[^>]*>/g)?.slice(1) ?? [];

    // SVG 1.1 does not allow transform on nested <svg>, and resvg ignores it,
    // which would draw the icon outside the circular mask.
    expect(nestedSvgTags.length).toBeGreaterThan(0);
    expect(nestedSvgTags.filter((tag) => tag.includes("transform="))).toEqual(
      [],
    );
  });
});
