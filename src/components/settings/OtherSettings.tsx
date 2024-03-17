import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const OtherSettings: Component = () => {
  const [iconParams, { setProps, reset }] = useIconParams();

  return (
    <>
      <ColorField
        label="background color"
        color={iconParams.background}
        setColor={(color) => setProps("background", color)}
        onReset={() => {
          reset("background");
        }}
      />
    </>
  );
};

export default OtherSettings;
