import type { Component } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import ColorField from "../UI/ColorField";

const OtherSettings: Component = () => {
  const [iconColors, { setColors, reset }] = useIconColors();

  return (
    <>
      <ColorField
        label="background color"
        color={iconColors.background}
        setColor={(color) => setColors("background", color)}
        onReset={() => {
          reset("background");
        }}
      />
    </>
  );
};

export default OtherSettings;
