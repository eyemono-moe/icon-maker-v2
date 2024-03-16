import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";
import PonyTail from "./Ponytail";

const Short = lazy(() => import("./Short"));

export const hairOptions = [
  {
    label: "Default",
    value: "short",
    component: Short,
  },
  {
    label: "Ponytail",
    value: "ponytail",
    component: PonyTail,
  },
] as const satisfies Options<string>;
