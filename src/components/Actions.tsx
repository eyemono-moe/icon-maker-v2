import { Menu } from "@ark-ui/solid/menu";
import { createHotkeys, detectPlatform } from "@tanstack/solid-hotkeys";
import { type Component, createSignal, onCleanup, onMount } from "solid-js";
import { Portal, isServer } from "solid-js/web";
import { useIconColors } from "~/context/iconColors";
import {
  copyImageUrl,
  copyPng,
  copySvg,
  downloadPng,
  downloadSvg,
} from "~/lib/saveImage";
import {
  type ShortcutPlatform,
  commandShortcuts,
  formatCommandShortcut,
} from "~/lib/shortcuts";
import { toast } from "~/lib/toast";
import "../assets/menubar.css";
import { iconSvgId } from "./Icon";

const triggerClass =
  "rounded inline-flex items-center justify-center px-2 outline-none bg-transparent enabled:hover:bg-zinc-300/50 data-[state=open]:bg-zinc-300/50 focus-visible:(outline-2 outline-solid outline-purple-600 outline-offset-1)";
const contentClass =
  "min-w-200px outline-none p-1 bg-white rounded border-1 shadow origin-[--transform-origin] animate-[contentHide] animate-duration-200 data-[state=open]:(animate-[contentShow] animate-duration-200)";
const itemClass =
  "parent outline-none rounded flex items-center pr-2 py-0.5 pl-6 relative select-none data-[state=open]:(bg-purple c-purple-200) data-[disabled]:(opacity-50 pointer-events-none) data-[highlighted]:(bg-purple-600! c-white!)";
const itemRightSlot = "text-xs ml-a pl-4";
const separatorClass = "h-px m-2";
const indicatorClass = "absolute left-1";

const Actions: Component = () => {
  const [
    _,
    { reset, toggleAutosave, saveToUrl, randomize, undo, redo },
    configs,
  ] = useIconColors();
  const [activeMenu, setActiveMenu] = createSignal<"file" | "edit">("file");
  const [openMenu, setOpenMenu] = createSignal<"file" | "edit" | null>(null);
  const [shortcutPlatform, setShortcutPlatform] =
    createSignal<ShortcutPlatform>("linux");
  let fileTrigger!: HTMLButtonElement;
  let editTrigger!: HTMLButtonElement;
  let fileContent!: HTMLDivElement;
  let editContent!: HTMLDivElement;

  const withIcon =
    (
      action: (svg: HTMLElement) => void | Promise<void>,
      onError?: () => void,
    ) =>
    () => {
      const svg = document.getElementById(iconSvgId);
      if (!svg) return;
      try {
        const result = action(svg);
        if (result) void result.catch(() => onError?.());
      } catch {
        onError?.();
      }
    };

  const handleDownloadSvg = withIcon(downloadSvg, () =>
    toast.error("failed to download"),
  );
  const handleDownloadPng = withIcon(downloadPng, () =>
    toast.error("failed to download"),
  );
  const handleCopySvg = withIcon((svg) => {
    toast.promise(copySvg(svg), {
      loading: "copying...",
      success: () => "copied as SVG!",
      error: () => "failed to copy",
    });
  });
  const handleCopyPng = withIcon((svg) => {
    toast.promise(copyPng(svg), {
      loading: "copying...",
      success: () => "copied as PNG!",
      error: () => "failed to copy",
    });
  });
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

  const fileActions: Record<string, () => void> = {
    "copy-svg": handleCopySvg,
    "copy-png": handleCopyPng,
    "download-svg": handleDownloadSvg,
    "download-png": handleDownloadPng,
    "copy-svg-url": handleCopySvgUrl,
    "copy-png-url": handleCopyPngUrl,
  };
  const editActions: Record<string, () => void> = {
    undo,
    redo,
    save: saveToUrl,
    randomize,
    reset,
  };

  createHotkeys(
    [
      { hotkey: commandShortcuts.copySvg, callback: handleCopySvg },
      { hotkey: commandShortcuts.copySvgUrl, callback: handleCopySvgUrl },
      { hotkey: commandShortcuts.downloadSvg, callback: handleDownloadSvg },
      { hotkey: commandShortcuts.undo, callback: undo },
      { hotkey: commandShortcuts.redo, callback: redo },
      { hotkey: commandShortcuts.randomize, callback: randomize },
    ],
    { ignoreInputs: true },
  );

  const handleMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const focusedElement = document.activeElement;
      const currentMenu =
        focusedElement === fileTrigger || focusedElement === fileContent
          ? "file"
          : focusedElement === editTrigger || focusedElement === editContent
            ? "edit"
            : null;
      const activeItemId = focusedElement?.getAttribute(
        "aria-activedescendant",
      );
      const activeItem = activeItemId
        ? document.getElementById(activeItemId)
        : null;

      const opensSubmenu =
        event.key === "ArrowRight" &&
        activeItem?.dataset.part === "trigger-item";

      if (currentMenu && !opensSubmenu) {
        event.preventDefault();
        event.stopPropagation();
        const nextMenu = currentMenu === "file" ? "edit" : "file";
        const wasOpen = openMenu() !== null;
        setActiveMenu(nextMenu);
        (nextMenu === "file" ? fileTrigger : editTrigger).focus();
        if (wasOpen) setOpenMenu(nextMenu);
        return;
      }
    }
  };

  onMount(() => {
    setShortcutPlatform(detectPlatform());
    if (!isServer)
      document.addEventListener("keydown", handleMenuKeyDown, true);
  });
  onCleanup(() => {
    if (!isServer)
      document.removeEventListener("keydown", handleMenuKeyDown, true);
  });

  return (
    <div class="w-full flex items-center" role="menubar">
      <Menu.Root
        open={openMenu() === "file"}
        onOpenChange={(details) =>
          setOpenMenu((current) =>
            details.open ? "file" : current === "file" ? null : current,
          )
        }
        positioning={{ placement: "bottom-start" }}
        onSelect={(details) => fileActions[details.value]?.()}
      >
        <Menu.Trigger
          ref={(element) => (fileTrigger = element)}
          role="menuitem"
          tabIndex={activeMenu() === "file" ? 0 : -1}
          onFocus={() => setActiveMenu("file")}
          onPointerEnter={() => {
            if (openMenu() && openMenu() !== "file") {
              setActiveMenu("file");
              setOpenMenu("file");
            }
          }}
          class={triggerClass}
        >
          File
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              ref={(element) => (fileContent = element)}
              class={contentClass}
            >
              <Menu.Item class={itemClass} value="copy-svg">
                Copy as SVG
                <div class={itemRightSlot}>
                  {formatCommandShortcut("copySvg", shortcutPlatform())}
                </div>
              </Menu.Item>
              <Menu.Root
                positioning={{ placement: "right-start", gutter: 4 }}
                onSelect={(details) => fileActions[details.value]?.()}
              >
                <Menu.TriggerItem class={itemClass}>
                  Copy as...
                  <div class={itemRightSlot}>
                    <div class="i-material-symbols:chevron-right-rounded w-4 h-4" />
                  </div>
                </Menu.TriggerItem>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content class={contentClass}>
                      <Menu.Item class={itemClass} value="copy-png">
                        Copy as PNG
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              <Menu.Separator class={separatorClass} />
              <Menu.Root
                positioning={{ placement: "right-start", gutter: 4 }}
                onSelect={(details) => fileActions[details.value]?.()}
              >
                <Menu.TriggerItem class={itemClass}>
                  Download as...
                  <div class={itemRightSlot}>
                    <div class="i-material-symbols:chevron-right-rounded w-4 h-4" />
                  </div>
                </Menu.TriggerItem>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content class={contentClass}>
                      <Menu.Item class={itemClass} value="download-svg">
                        Download as SVG
                        <div class={itemRightSlot}>
                          {formatCommandShortcut(
                            "downloadSvg",
                            shortcutPlatform(),
                          )}
                        </div>
                      </Menu.Item>
                      <Menu.Item class={itemClass} value="download-png">
                        Download as PNG
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              <Menu.Separator class={separatorClass} />
              <Menu.Root
                positioning={{ placement: "right-start", gutter: 4 }}
                onSelect={(details) => fileActions[details.value]?.()}
              >
                <Menu.TriggerItem class={itemClass}>
                  Share
                  <div class={itemRightSlot}>
                    <div class="i-material-symbols:chevron-right-rounded w-4 h-4" />
                  </div>
                </Menu.TriggerItem>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content class={contentClass}>
                      <Menu.Item class={itemClass} value="copy-svg-url">
                        Copy SVG url
                        <div class={itemRightSlot}>
                          {formatCommandShortcut(
                            "copySvgUrl",
                            shortcutPlatform(),
                          )}
                        </div>
                      </Menu.Item>
                      <Menu.Item class={itemClass} value="copy-png-url">
                        Copy PNG url
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <Menu.Root
        open={openMenu() === "edit"}
        onOpenChange={(details) =>
          setOpenMenu((current) =>
            details.open ? "edit" : current === "edit" ? null : current,
          )
        }
        positioning={{ placement: "bottom-start" }}
        onSelect={(details) => editActions[details.value]?.()}
      >
        <Menu.Trigger
          ref={(element) => (editTrigger = element)}
          role="menuitem"
          tabIndex={activeMenu() === "edit" ? 0 : -1}
          onFocus={() => setActiveMenu("edit")}
          onPointerEnter={() => {
            if (openMenu() && openMenu() !== "edit") {
              setActiveMenu("edit");
              setOpenMenu("edit");
            }
          }}
          class={triggerClass}
        >
          Edit
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              ref={(element) => (editContent = element)}
              class={contentClass}
            >
              <Menu.Item class={itemClass} value="undo">
                Undo
                <div class={itemRightSlot}>
                  {formatCommandShortcut("undo", shortcutPlatform())}
                </div>
              </Menu.Item>
              <Menu.Item class={itemClass} value="redo">
                Redo
                <div class={itemRightSlot}>
                  {formatCommandShortcut("redo", shortcutPlatform())}
                </div>
              </Menu.Item>
              <Menu.Separator class={separatorClass} />
              <Menu.Item
                class={itemClass}
                value="save"
                title="Save current state to URL search params"
              >
                Save
              </Menu.Item>
              <Menu.CheckboxItem
                class={itemClass}
                value="autosave"
                checked={configs.autosave}
                onCheckedChange={() => toggleAutosave()}
              >
                <Menu.ItemIndicator class={indicatorClass}>
                  <div class="i-material-symbols:check-small-rounded w-4 h-4" />
                </Menu.ItemIndicator>
                Auto save
              </Menu.CheckboxItem>
              <Menu.Separator class={separatorClass} />
              <Menu.Item class={itemClass} value="randomize">
                Randomize
                <div class={itemRightSlot}>
                  {formatCommandShortcut("randomize", shortcutPlatform())}
                </div>
              </Menu.Item>
              <Menu.Separator class={separatorClass} />
              <Menu.Item class={itemClass} value="reset">
                Reset all
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </div>
  );
};

export default Actions;
