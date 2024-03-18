import { Menubar } from "@kobalte/core";
import { type Component, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { useIconParams } from "~/context/icon";
import {
  copyImageUrl,
  copyPng,
  copySvg,
  downloadPng,
  downloadSvg,
} from "~/lib/saveImage";
import { toast } from "~/lib/toast";
import "../assets/menubar.css";
import { iconSvgId } from "./Icon";

const contentClass =
  "min-w-200px outline-none p-1 bg-white rounded border-1 shadow origin-[--kb-menu-content-transform-origin] animate-[contentHide] animate-duration-200 data-[expanded]:(animate-[contentShow] animate-duration-200)";
const itemClass =
  "parent outline-none rounded flex items-center pr-2 py-0.5 pl-6 relative select-none data-[expanded]:(bg-purple c-purple-200) data-[disabled]:(opacity-50 pointer-events-none) data-[highlighted]:(bg-purple-600! c-white!)";
const itemRightSlot = "text-xs ml-a pl-4";
const separatorClass = "h-px m-2";
const indicatorClass = "absolute left-1";

const Actions: Component = () => {
  const [
    _,
    { reset, toggleAutosave, saveToUrl, randomize, undo, redo },
    configs,
  ] = useIconParams();

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById(iconSvgId);
    if (svgEl === null) return;
    downloadSvg(svgEl);
  };
  const handleDownloadPng = () => {
    const svgEl = document.getElementById(iconSvgId);
    if (svgEl === null) return;
    downloadPng(svgEl);
  };
  const handleCopySvg = () => {
    const svgEl = document.getElementById(iconSvgId);
    if (svgEl === null) return;
    toast.promise(copySvg(svgEl), {
      loading: "copying...",
      success: () => "copied as SVG!",
      error: () => "failed to copy",
    });
  };
  const handleCopyPng = () => {
    const svgEl = document.getElementById(iconSvgId);
    if (svgEl === null) return;
    toast.promise(copyPng(svgEl), {
      loading: "copying...",
      success: () => "copied as PNG!",
      error: () => "failed to copy",
    });
  };
  const handleCopySvgUrl = () => {
    toast.promise(copyImageUrl("svg"), {
      loading: "copying...",
      success: () => "copied SVG url!",
      error: () => "failed to copy",
    });
  };
  const handleCopyPngUrl = () => {
    toast.promise(copyImageUrl("png"), {
      loading: "copying...",
      success: () => "copied PNG url!",
      error: () => "failed to copy",
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === "C") {
      handleCopySvg();
    }
    if (e.ctrlKey && e.altKey && e.key === "c") {
      handleCopySvgUrl();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "S") {
      handleDownloadSvg();
    }

    e.preventDefault();
    if (e.ctrlKey && e.key === "z") {
      undo();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "Z") {
      redo();
    }
  };

  onMount(() => {
    if (!isServer) {
      document.addEventListener("keydown", handleKeyDown);
    }
  });
  onCleanup(() => {
    if (!isServer) {
      document.removeEventListener("keydown", handleKeyDown);
    }
  });

  return (
    <>
      <Menubar.Root class="w-full flex items-center children:(rounded inline-flex items-center justify-center px-2 outline-none bg-transparent) enabled:hover:children:bg-zinc-300 data-[expanded]:children:bg-zinc-300">
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content class={contentClass}>
              <Menubar.Item class={itemClass} onSelect={handleCopySvg}>
                Copy as SVG
                <div class={itemRightSlot}>Ctrl + Shift + C</div>
              </Menubar.Item>
              <Menubar.Sub overlap gutter={4} shift={-5}>
                <Menubar.SubTrigger class={itemClass}>
                  Copy as...
                  <div class={itemRightSlot}>
                    <div class="i-material-symbols:chevron-right-rounded w-4 h-4" />
                  </div>
                </Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent class={contentClass}>
                    <Menubar.Item class={itemClass} onSelect={handleCopyPng}>
                      Copy as PNG
                    </Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>
              <Menubar.Separator class={separatorClass} />
              <Menubar.Sub overlap gutter={4} shift={-5}>
                <Menubar.SubTrigger class={itemClass}>
                  Download as...
                  <div class={itemRightSlot}>
                    <div class="i-material-symbols:chevron-right-rounded w-4 h-4" />
                  </div>
                </Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent class={contentClass}>
                    <Menubar.Item
                      class={itemClass}
                      onSelect={handleDownloadSvg}
                    >
                      Download as SVG
                      <div class={itemRightSlot}>Ctrl + Shift + S</div>
                    </Menubar.Item>
                    <Menubar.Item
                      class={itemClass}
                      onSelect={handleDownloadPng}
                    >
                      Download as PNG
                    </Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>
              <Menubar.Separator class={separatorClass} />
              <Menubar.Sub overlap gutter={4} shift={-5}>
                <Menubar.SubTrigger class={itemClass}>
                  Share
                  <div class={itemRightSlot}>
                    <div class="i-material-symbols:chevron-right-rounded w-4 h-4" />
                  </div>
                </Menubar.SubTrigger>
                <Menubar.Portal>
                  <Menubar.SubContent class={contentClass}>
                    <Menubar.Item class={itemClass} onSelect={handleCopySvgUrl}>
                      Copy SVG url
                      <div class={itemRightSlot}>Ctrl + Alt + C</div>
                    </Menubar.Item>
                    <Menubar.Item class={itemClass} onSelect={handleCopyPngUrl}>
                      Copy PNG url
                    </Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Portal>
              </Menubar.Sub>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content class={contentClass}>
              <Menubar.Item class={itemClass} onSelect={undo}>
                Undo
                <div class={itemRightSlot}>Ctrl + Z</div>
              </Menubar.Item>
              <Menubar.Item class={itemClass} onSelect={redo}>
                Redo
                <div class={itemRightSlot}>Ctrl + Shift + Z</div>
              </Menubar.Item>
              <Menubar.Separator class={separatorClass} />
              <Menubar.Item
                class={itemClass}
                onSelect={saveToUrl}
                title="Save current state to URL search params"
              >
                Save
              </Menubar.Item>
              <Menubar.CheckboxItem
                class={itemClass}
                checked={configs.autosave}
                onChange={toggleAutosave}
              >
                <Menubar.ItemIndicator class={indicatorClass}>
                  <div class="i-material-symbols:check-small-rounded w-4 h-4" />
                </Menubar.ItemIndicator>
                Auto save
              </Menubar.CheckboxItem>
              <Menubar.Separator class={separatorClass} />
              <Menubar.Item class={itemClass} onSelect={randomize}>
                Randomize
              </Menubar.Item>
              <Menubar.Separator class={separatorClass} />
              <Menubar.Item class={itemClass} onSelect={reset}>
                Reset all
              </Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
    </>
  );
};

export default Actions;
