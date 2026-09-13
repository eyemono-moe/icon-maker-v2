import { describe, expect, test } from "vitest";
import { commandShortcuts, formatCommandShortcut } from "~/lib/shortcuts";

describe("command shortcuts", () => {
  test("uses cross-platform Mod bindings for every application command", () => {
    expect(commandShortcuts).toEqual({
      copySvg: "Mod+Shift+C",
      copySvgUrl: "Mod+Alt+C",
      downloadSvg: "Mod+Shift+S",
      undo: "Mod+Z",
      redo: "Mod+Shift+Z",
      randomize: "Mod+Shift+L",
    });
  });

  test("formats menu labels for macOS and non-macOS platforms", () => {
    expect(formatCommandShortcut("copySvg", "mac")).toBe("Command + Shift + C");
    expect(formatCommandShortcut("copySvg", "windows")).toBe(
      "Ctrl + Shift + C",
    );
    expect(formatCommandShortcut("copySvgUrl", "linux")).toBe("Ctrl + Alt + C");
  });
});
