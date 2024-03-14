import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Default = lazy(() => import("./Default"));

export const headFillDefId = "head-fill-def";

export const headOptions: Options<"head"> = [
  {
    label: "Default",
    value: "default",
    component: Default,
  },
];
