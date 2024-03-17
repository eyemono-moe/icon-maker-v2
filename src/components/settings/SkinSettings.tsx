import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const SkinSettings: Component = () => {
  const [iconParams, { setProps, computeColors, reset }] = useIconParams();

  return (
    <>
      <ColorField
        label="skin color"
        color={iconParams.head.baseColor}
        setColor={(color) => setProps("head", "baseColor", color)}
        resetColor={() => {
          reset("head", "baseColor");
        }}
      />
      <ColorField
        label="shadow color"
        color={iconParams.head.shadowColor}
        fallbackColor={computeColors.head.computedShadowColor}
        setColor={(color) => setProps("head", "shadowColor", color)}
        canEmpty
        resetColor={() => {
          reset("head", "shadowColor");
        }}
      />
      <ColorField
        label="line color"
        color={iconParams.head.strokeColor}
        fallbackColor={computeColors.head.computedStrokeColor}
        setColor={(color) => setProps("head", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          reset("head", "strokeColor");
        }}
      />
    </>
  );
};

export default SkinSettings;
