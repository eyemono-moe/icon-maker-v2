import "virtual:uno.css";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "@unocss/reset/tailwind-compat.css";
import { Suspense } from "solid-js";
import { IconColorsProvider } from "./context/iconColors";
import { Toaster } from "./lib/toast";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <IconColorsProvider>
            <Suspense>{props.children}</Suspense>
          </IconColorsProvider>
          <Toaster />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
