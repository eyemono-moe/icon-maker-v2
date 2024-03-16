import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Short = lazy(() => import("./Short"));
const PonyTail = lazy(() => import("./Ponytail"));
const Blunt = lazy(() => import("./Blunt"));

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
  {
    label: "Blunt",
    value: "blunt",
    component: Blunt,
  },
] as const satisfies Options<string>;
