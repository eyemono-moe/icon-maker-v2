import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Default = lazy(() => import("./Default"));
const Komari = lazy(() => import("./Komari"));
const Angry = lazy(() => import("./Angry"));

export const eyebrowsOptions = [
  {
    label: "Default",
    value: "default",
    component: Default,
  },
  {
    label: "困り",
    value: "komari",
    component: Komari,
  },
  {
    label: "怒り",
    value: "angry",
    component: Angry,
  },
] as const satisfies Options<string>;
