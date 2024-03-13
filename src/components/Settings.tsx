import { Tabs } from "@kobalte/core";
import type { Component } from "solid-js";
import EyesSettings from "./settings/EyesSettings";
import HairSettings from "./settings/HairSettings";
import MouthSettings from "./settings/MouthSettings";
import OtherSettings from "./settings/OtherSettings";
import SkinSettings from "./settings/SkinSettings";

const Settings: Component = () => {
  return (
    <div class="w-full">
      <h2>Settings</h2>
      <Tabs.Root>
        <Tabs.List class="flex gap-2">
          <Tabs.Trigger value="hair">hair</Tabs.Trigger>
          <Tabs.Trigger value="skin">skin</Tabs.Trigger>
          <Tabs.Trigger value="eye">eye</Tabs.Trigger>
          <Tabs.Trigger value="mouth">mouth</Tabs.Trigger>
          <Tabs.Trigger value="other">other</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
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
      </Tabs.Root>
    </div>
  );
};

export default Settings;
