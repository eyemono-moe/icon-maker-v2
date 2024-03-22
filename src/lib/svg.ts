import { optimize } from "svgo";

export const optimizeSvg = (svgText: string) =>
  optimize(svgText, {
    plugins: [
      "removeEmptyContainers",
      "removeComments",
      "removeUselessDefs",
      "collapseGroups",
      "cleanupNumericValues",
      {
        name: "removeUnknownsAndDefaults",
        params: {
          keepDataAttrs: false,
        },
      },
      {
        name: "removeComments",
        params: {
          preservePatterns: false,
        },
      },
    ],
  }).data;

type Path = {
  command: string;
  args: number[];
}[];

const SEGMENT_REGEXP = /([achlmqstvz])([^achlmqstvz]*)/gi;

const NUMBER_REGEXP = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

const parseArgs = (args: string): number[] => {
  const numbers = args.match(NUMBER_REGEXP);
  return numbers?.map(Number) ?? [];
};

const parsePath = (d: string): Path => {
  const matches = d.matchAll(SEGMENT_REGEXP);
  return Array.from(matches, ([_, command, argsStr]) => ({
    command,
    args: parseArgs(argsStr),
  }));
};

export class SvgInterpolate {
  private path1: Path;
  private path2: Path;

  constructor(d1: string, d2: string) {
    this.path1 = parsePath(d1);
    this.path2 = parsePath(d2);
    if (this.path1.length !== this.path2.length) {
      throw new Error(
        `Path length mismatch: ${this.path1.length} !== ${this.path2.length}`,
      );
    }
    if (
      this.path1.some(({ command }, i) => command !== this.path2[i].command)
    ) {
      throw new Error("Command mismatch");
    }
    if (
      this.path1.some(
        ({ args }, i) => args.length !== this.path2[i].args.length,
      )
    ) {
      throw new Error("Argument length mismatch");
    }
  }

  static toStr(path: Path): string {
    return path
      .map(({ command, args }) => `${command}${args.join(" ")}`)
      .join("");
  }

  linear(t: number): string {
    const path = this.path1.map(({ command, args }, i) => {
      const args2 = this.path2[i].args;
      return {
        command,
        args: args.map((arg, j) => arg + (args2[j] - arg) * t),
      };
    });
    return SvgInterpolate.toStr(path);
  }
}
