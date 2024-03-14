import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Short = lazy(() => import("./Short"));

export const hairOptions: Options<"hair"> = [
  {
    label: "Default",
    value: "short",
    component: Short,
  },
];
