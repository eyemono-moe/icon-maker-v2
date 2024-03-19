import { Tabs } from "@kobalte/core";
import type { Component } from "solid-js";
import EyesSettings from "./settings/EyesSettings";
import HairSettings from "./settings/HairSettings";
import MouthSettings from "./settings/MouthSettings";
import OtherSettings from "./settings/OtherSettings";
import SkinSettings from "./settings/SkinSettings";

const Settings: Component = () => {
  return (
    <Tabs.Root class="w-full h-full min-w-fit grid grid-rows-[auto_1fr] overflow-hidden">
      <Tabs.List class="relative font-700 flex overflow-x-auto b-b-1 children-[button]:(px-4 py-1 bg-transparent outline-none) hover:children-[button]:bg-zinc/20">
        <Tabs.Trigger value="hair">hair</Tabs.Trigger>
        <Tabs.Trigger value="skin">skin</Tabs.Trigger>
        <Tabs.Trigger value="eye">eye</Tabs.Trigger>
        <Tabs.Trigger value="mouth">mouth</Tabs.Trigger>
        <Tabs.Trigger value="other">other</Tabs.Trigger>
        <Tabs.Indicator class="absolute bg-purple-600 transition-all-100 h-2px bottom-0" />
      </Tabs.List>
      <div class="children:(flex flex-col gap-2) overflow-y-auto p-2">
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
      </div>
    </Tabs.Root>
  );
};

export default Settings;
