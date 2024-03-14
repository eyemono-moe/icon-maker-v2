import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Short = lazy(() => import("./Short"));

export const hairOptions = [
  {
    label: "Default",
    value: "short",
    component: Short,
  },
] as const satisfies Options<string>;
