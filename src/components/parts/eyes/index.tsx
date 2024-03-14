import { lazy } from "solid-js";
import type { Options } from "~/components/UI/PartsSelect";

const Batsu = lazy(() => import("./Batsu"));
const Close = lazy(() => import("./Close"));
const Default = lazy(() => import("./Default"));
const Funky = lazy(() => import("./Funky"));
const Guru = lazy(() => import("./Guru"));
const Hau = lazy(() => import("./Hau"));
const Jito = lazy(() => import("./Jito"));
const Small = lazy(() => import("./Small"));

export const eyesOptions = [
  { label: "Default", value: "default", component: Default },
  { label: "Jito", value: "jito", component: Jito },
  { label: "Close", value: "close", component: Close },
  { label: "Small", value: "small", component: Small },
  { label: "Funky", value: "funky", component: Funky },
  { label: "Batsu", value: "batsu", component: Batsu },
  { label: "Guru", value: "guru", component: Guru },
  { label: "Hau", value: "hau", component: Hau },
] as const satisfies Options<string>;
