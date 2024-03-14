import "virtual:uno.css";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "@unocss/reset/tailwind-compat.css";
import { Suspense } from "solid-js";
import { IconParamsProvider } from "./context/icon";
import { Toaster } from "./lib/toast";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <IconParamsProvider>
            <Suspense>{props.children}</Suspense>
          </IconParamsProvider>
          <Toaster />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
