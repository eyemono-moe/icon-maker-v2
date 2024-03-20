import "virtual:uno.css";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "@unocss/reset/tailwind-compat.css";
import { Suspense } from "solid-js";
import { CameraProvider } from "./context/camera";
import { IconColorsProvider } from "./context/iconColors";
import { IconTransformsProvider } from "./context/iconTransforms";
import { Toaster } from "./lib/toast";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <CameraProvider>
            <IconTransformsProvider>
              <IconColorsProvider>
                <Suspense>{props.children}</Suspense>
              </IconColorsProvider>
            </IconTransformsProvider>
          </CameraProvider>
          <Toaster />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
