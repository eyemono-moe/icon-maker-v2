import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Default = lazy(() => import("./Default"));

export const headFillDefId = "head-fill-def";

export const headOptions = [
  {
    label: "Default",
    value: "default",
    component: Default,
  },
] as const satisfies Options<string>;
