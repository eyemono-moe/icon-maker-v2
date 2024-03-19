import type { Component } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { hairOptions } from "../parts/hair";

const HairSettings: Component = () => {
  const [iconColors, { setColors, computeColors, reset }] = useIconColors();

  return (
    <>
      <PartsSelect
        options={hairOptions}
        label="hair type"
        value={iconColors.hair.type}
        onChange={(value) => {
          setColors("hair", "type", value);
        }}
        previewViewBox="0 0 400 400"
        onReset={() => {
          reset("hair", "type");
        }}
      />
      <ColorField
        label="base color"
        color={iconColors.hair.baseColor}
        setColor={(color) => setColors("hair", "baseColor", color)}
        onReset={() => {
          reset("hair", "baseColor");
        }}
      />
      <ColorField
        label="highlight color"
        color={iconColors.hair.highlightColor}
        fallbackColor={computeColors.hair.computedHighlightColor}
        setColor={(color) => setColors("hair", "highlightColor", color)}
        canEmpty
        onReset={() => {
          reset("hair", "highlightColor");
        }}
      />
      <ColorField
        label="stroke color"
        color={iconColors.hair.strokeColor}
        fallbackColor={computeColors.hair.computedStrokeColor}
        setColor={(color) => setColors("hair", "strokeColor", color)}
        canEmpty
        onReset={() => {
          reset("hair", "strokeColor");
        }}
      />
    </>
  );
};

export default HairSettings;
