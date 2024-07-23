import { Splitter } from "@ark-ui/solid";
import { createBreakpoints } from "@solid-primitives/media";
import { type Component, createSignal, onMount } from "solid-js";
import Header from "~/components/Header";
import Settings from "~/components/Settings";
import { FaceDetectProvider } from "~/context/faceDetect";
import {
  type IconColors,
  IconColorsProvider,
  parseColors,
} from "~/context/iconColors";
import { IconTransformsProvider } from "~/context/iconTransforms";
import IconWrapper from "./IconWrapper";
import ShowOnMount from "./ShowOnMount";

const breakPoints = {
  md: "768px",
};

const MainView: Component = () => {
  const [isFull, setIsFull] = createSignal(false);
  const [param, setParam] = createSignal<IconColors>();

  const matches = createBreakpoints(breakPoints);

  const getParam = () => {
    const search = new URLSearchParams(window.location.search);
    const param = search.get("p");
    return param ? parseColors(param) : undefined;
  };

  onMount(() => {
    setParam(getParam());
  });

  return (
    <FaceDetectProvider>
      <IconTransformsProvider>
        <IconColorsProvider params={param()}>
          <div
            class="grid w-full h-full prose prose-zinc max-w-unset! overflow-hidden"
            classList={{
              "grid-rows-[1fr]": isFull(),
              "grid-rows-[auto_1fr]": !isFull(),
            }}
          >
            <div
              classList={{
                "hidden!": isFull(),
              }}
            >
              <Header />
            </div>
            <ShowOnMount>
              <main class="h-full w-full overflow-hidden">
                <Splitter.Root
                  orientation={matches.md ? "horizontal" : "vertical"}
                  size={[
                    { id: "icon", size: 50, minSize: 20 },
                    { id: "settings", size: 50, minSize: 20 },
                  ]}
                >
                  <Splitter.Panel id="icon">
                    <IconWrapper isFull={isFull()} setIsFull={setIsFull} />
                  </Splitter.Panel>
                  <Splitter.ResizeTrigger
                    id="icon:settings"
                    class="outline-none min-w-1 min-h-1 bg-zinc-200"
                    classList={{
                      "hidden!": isFull(),
                    }}
                  />
                  <Splitter.Panel
                    id="settings"
                    classList={{
                      "hidden!": isFull(),
                    }}
                  >
                    <Settings />
                  </Splitter.Panel>
                </Splitter.Root>
              </main>
            </ShowOnMount>
          </div>
        </IconColorsProvider>
      </IconTransformsProvider>
    </FaceDetectProvider>
  );
};

export default MainView;
