import type { Component } from "solid-js";
import { copyPng, copySvg, downloadPng, downloadSvg } from "~/lib/saveImage";
import { toast } from "~/lib/toast";
import { iconSvgId } from "./Icon";
import Button from "./UI/Button";

const Actions: Component = () => {
  return (
    <div class="flex gap-2 flex-col items-end">
      <div class="flex gap-2 items-center">
        download image as
        <Button
          type="button"
          onclick={() => {
            const svgEl = document.getElementById(iconSvgId);
            if (svgEl === null) return;
            downloadPng(svgEl);
          }}
        >
          PNG
        </Button>
        /
        <Button
          type="button"
          onclick={() => {
            const svgEl = document.getElementById(iconSvgId);
            if (svgEl === null) return;
            downloadSvg(svgEl);
          }}
        >
          SVG
        </Button>
      </div>
      <div class="flex gap-2 items-center">
        copy image as
        <Button
          type="button"
          onclick={() => {
            const svgEl = document.getElementById(iconSvgId);
            if (svgEl === null) return;
            toast.promise(copyPng(svgEl), {
              loading: "copying...",
              success: () => "copied as PNG!",
              error: () => "failed to copy",
            });
          }}
        >
          PNG
        </Button>
        /
        <Button
          type="button"
          onclick={() => {
            const svgEl = document.getElementById(iconSvgId);
            if (svgEl === null) return;
            toast.promise(copySvg(svgEl), {
              loading: "copying...",
              success: () => "copied as SVG!",
              error: () => "failed to copy",
            });
          }}
        >
          SVG
        </Button>
      </div>
    </div>
  );
};

export default Actions;
