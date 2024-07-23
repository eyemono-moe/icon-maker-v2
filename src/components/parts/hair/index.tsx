import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Short = lazy(() => import("./Short"));
const PonyTail = lazy(() => import("./Ponytail"));
const Blunt = lazy(() => import("./Blunt"));
const BluntPonyTail = lazy(() => import("./BluntPonytail"));

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
  {
    label: "Blunt Ponytail",
    value: "bluntPonytail",
    component: BluntPonyTail,
  },
] as const satisfies Options<string>;
