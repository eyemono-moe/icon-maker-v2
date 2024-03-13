// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: <div id="app" /> in `entry-server.tsx`
mount(() => <StartClient />, document.getElementById("app")!);
