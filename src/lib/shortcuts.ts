import { formatForDisplay } from "@tanstack/solid-hotkeys";

export const commandShortcuts = {
  copySvg: "Mod+Shift+C",
  copySvgUrl: "Mod+Alt+C",
  downloadSvg: "Mod+Shift+S",
  undo: "Mod+Z",
  redo: "Mod+Shift+Z",
  randomize: "Mod+Shift+L",
} as const;

export type CommandShortcut = keyof typeof commandShortcuts;
export type ShortcutPlatform = "mac" | "windows" | "linux";

export const formatCommandShortcut = (
  command: CommandShortcut,
  platform?: ShortcutPlatform,
) => {
  const label = formatForDisplay(commandShortcuts[command], {
    platform,
    useSymbols: false,
    separatorToken: " + ",
  });

  return platform === "mac" ? label.replace("Cmd", "Command") : label;
};
