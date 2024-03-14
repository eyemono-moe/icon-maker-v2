import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Default = lazy(() => import("./Default"));
const Smile = lazy(() => import("./Smile"));
const A = lazy(() => import("./A"));
const E = lazy(() => import("./E"));
const I = lazy(() => import("./I"));
const O = lazy(() => import("./O"));
const U = lazy(() => import("./U"));
const Gunya = lazy(() => import("./Gunya"));
const Uwa = lazy(() => import("./Uwa"));
const Atsui = lazy(() => import("./Atsui"));

export const mouthOptions: Options<"mouth"> = [
  {
    label: "Default",
    value: "default",
    component: Default,
  },
  {
    label: "Smile",
    value: "smile",
    component: Smile,
  },
  {
    label: "A",
    value: "a",
    component: A,
  },
  {
    label: "E",
    value: "e",
    component: E,
  },
  {
    label: "I",
    value: "i",
    component: I,
  },
  {
    label: "O",
    value: "o",
    component: O,
  },
  {
    label: "U",
    value: "u",
    component: U,
  },
  {
    label: "Gunya",
    value: "gunya",
    component: Gunya,
  },
  {
    label: "Uwa",
    value: "uwa",
    component: Uwa,
  },
  {
    label: "Atsui",
    value: "atsui",
    component: Atsui,
  },
];
