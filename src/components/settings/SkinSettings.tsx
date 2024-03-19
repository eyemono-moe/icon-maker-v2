import type { Component } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import ColorField from "../UI/ColorField";

const SkinSettings: Component = () => {
  const [iconColors, { setColors, computeColors, reset }] = useIconColors();

  return (
    <>
      <ColorField
        label="skin color"
        color={iconColors.head.baseColor}
        setColor={(color) => setColors("head", "baseColor", color)}
        onReset={() => {
          reset("head", "baseColor");
        }}
      />
      <ColorField
        label="shadow color"
        color={iconColors.head.shadowColor}
        fallbackColor={computeColors.head.computedShadowColor}
        setColor={(color) => setColors("head", "shadowColor", color)}
        canEmpty
        onReset={() => {
          reset("head", "shadowColor");
        }}
      />
      <ColorField
        label="line color"
        color={iconColors.head.strokeColor}
        fallbackColor={computeColors.head.computedStrokeColor}
        setColor={(color) => setColors("head", "strokeColor", color)}
        canEmpty
        onReset={() => {
          reset("head", "strokeColor");
        }}
      />
    </>
  );
};

export default SkinSettings;
