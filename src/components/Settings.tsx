import { Tabs } from "@ark-ui/solid/tabs";
import type { Component } from "solid-js";
import CameraSettings from "./settings/CameraSettings";
import EyesSettings from "./settings/EyesSettings";
import HairSettings from "./settings/HairSettings";
import MouthSettings from "./settings/MouthSettings";
import OtherSettings from "./settings/OtherSettings";
import SkinSettings from "./settings/SkinSettings";

const tabClass =
  "focus-visible:(outline-2 outline-solid outline-purple-600 outline-offset--2)";

const Settings: Component = () => {
  return (
    <Tabs.Root
      class="w-full h-full min-w-fit grid grid-rows-[auto_1fr] overflow-hidden"
      defaultValue="hair"
      lazyMount={false}
      unmountOnExit={false}
    >
      <Tabs.List class="relative font-700 flex overflow-x-auto b-b-1 children-[button]:(px-4 py-1 bg-transparent) hover:children-[button]:bg-zinc/20">
        <Tabs.Trigger class={tabClass} value="hair">
          hair
        </Tabs.Trigger>
        <Tabs.Trigger class={tabClass} value="skin">
          skin
        </Tabs.Trigger>
        <Tabs.Trigger class={tabClass} value="eye">
          eye
        </Tabs.Trigger>
        <Tabs.Trigger class={tabClass} value="mouth">
          mouth
        </Tabs.Trigger>
        <Tabs.Trigger class={tabClass} value="other">
          other
        </Tabs.Trigger>
        <Tabs.Trigger class={tabClass} value="camera">
          camera
        </Tabs.Trigger>
        <Tabs.Indicator class="absolute bg-purple-600 w-[--width] transition-all-100 h-2px bottom-0" />
      </Tabs.List>
      <div class="overflow-auto">
        <div class="children:(flex flex-col gap-2) min-w-fit p-2">
          <Tabs.Content value="hair">
            <HairSettings />
          </Tabs.Content>
          <Tabs.Content value="skin">
            <SkinSettings />
          </Tabs.Content>
          <Tabs.Content value="eye">
            <EyesSettings />
          </Tabs.Content>
          <Tabs.Content value="mouth">
            <MouthSettings />
          </Tabs.Content>
          <Tabs.Content value="other">
            <OtherSettings />
          </Tabs.Content>
          {/* カメラ利用中は Video 要素を維持するため、全パネルをマウントしたまま非表示にする */}
          <Tabs.Content value="camera" class="not-[[data-selected]]:hidden">
            <CameraSettings />
          </Tabs.Content>
        </div>
      </div>
    </Tabs.Root>
  );
};

export default Settings;
