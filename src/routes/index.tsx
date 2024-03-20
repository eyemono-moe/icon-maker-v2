import { Splitter } from "@ark-ui/solid";
import { createBreakpoints } from "@solid-primitives/media";
import { Link, Meta, Title } from "@solidjs/meta";
import { Show, createSignal } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import { object, optional, string } from "valibot";
import Header from "~/components/Header";
import Icon from "~/components/Icon";
import Settings from "~/components/Settings";
import { FaceDetectProvider } from "~/context/faceDetect";
import {
  IconColorsProvider,
  parseColors,
  useIconColors,
} from "~/context/iconColors";
import { useQuery } from "~/lib/query";

const querySchema = object({
  p: optional(string()),
});

const getParamsServer = () => {
  "use server";
  const event = getRequestEvent();
  if (event) {
    const query = useQuery(querySchema, event.nativeEvent);
    return query.p;
  }
};

const getParamsClient = () => {
  const search = new URLSearchParams(window.location.search);
  return search.get("p");
};

const breakPoints = {
  md: "768px",
};

export default function Home() {
  const serverIconParam = getParamsServer();
  const [isFull, setIsFull] = createSignal(false);

  const matches = createBreakpoints(breakPoints);

  const IconWrapper = () => {
    const [state] = useIconColors();
    return (
      <div
        class="relative grid place-items-center w-full h-full overflow-hidden min-w-0 min-h-0 children-[svg]:(w-[100cqmin] aspect-suqare h-auto)"
        style={{
          background: state.background,
          "container-type": "size",
        }}
      >
        <Icon />
        <button
          type="button"
          onClick={() => setIsFull((prev) => !prev)}
          class="absolute top-4 right-4 p-1 rounded-full bg-zinc-800 opacity-10 hover:enabled:opacity-50 transition-opacity-100"
        >
          <div
            class="w-6 h-6 c-zinc-50"
            classList={{
              "i-material-symbols:fullscreen-rounded": !isFull(),
              "i-material-symbols:fullscreen-exit-rounded": isFull(),
            }}
          />
        </button>
      </div>
    );
  };

  const param = () => {
    if (isServer) {
      return typeof serverIconParam === "string"
        ? parseColors(serverIconParam)
        : undefined;
    }
    const param = getParamsClient();
    return param ? parseColors(param) : undefined;
  };

  return (
    <>
      <Title>eyemono.moe icon maker</Title>
      <Meta
        property="og:image"
        content={`https://icon.eyemono.moe/ogp${
          serverIconParam ? `?p=${serverIconParam}` : ""
        }`}
      />
      <Meta
        property="twitter:image"
        content={`https://icon.eyemono.moe/ogp${
          serverIconParam ? `?p=${serverIconParam}` : ""
        }`}
      />
      <Link
        rel="icon"
        type="image/svg+xml"
        href={`/image?f=svg${serverIconParam ? `&p=${serverIconParam}` : ""}`}
      />
      <FaceDetectProvider>
        <IconColorsProvider params={param()}>
          <Show when={!isFull()} fallback={<IconWrapper />}>
            <div class="grid grid-rows-[auto_1fr] w-full h-full prose prose-zinc max-w-unset! overflow-hidden">
              <Header />
              <main class="h-full w-full overflow-hidden">
                <Splitter.Root
                  orientation={matches.md ? "horizontal" : "vertical"}
                  size={[
                    { id: "icon", size: 50, minSize: 20 },
                    { id: "settings", size: 50, minSize: 20 },
                  ]}
                >
                  <Splitter.Panel id="icon">
                    <IconWrapper />
                  </Splitter.Panel>
                  <Splitter.ResizeTrigger
                    class="outline-none min-w-1 min-h-1 bg-zinc-200"
                    id="icon:settings"
                  />
                  <Splitter.Panel id="settings">
                    <Settings />
                  </Splitter.Panel>
                </Splitter.Root>
              </main>
            </div>
          </Show>
        </IconColorsProvider>
      </FaceDetectProvider>
    </>
  );
}
