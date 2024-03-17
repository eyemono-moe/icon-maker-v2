import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { hairOptions } from "../parts/hair";

const HairSettings: Component = () => {
  const [iconParams, { setProps, computeColors, reset }] = useIconParams();

  return (
    <>
      <PartsSelect
        options={hairOptions}
        label="hair type"
        value={iconParams.hair.type}
        onChange={(value) => {
          setProps("hair", "type", value);
        }}
        previewViewBox="0 0 400 400"
      />
      <ColorField
        label="base color"
        color={iconParams.hair.baseColor}
        setColor={(color) => setProps("hair", "baseColor", color)}
        resetColor={() => {
          reset("hair", "baseColor");
        }}
      />
      <ColorField
        label="highlight color"
        color={iconParams.hair.highlightColor}
        fallbackColor={computeColors.hair.computedHighlightColor}
        setColor={(color) => setProps("hair", "highlightColor", color)}
        canEmpty
        resetColor={() => {
          reset("hair", "highlightColor");
        }}
      />
      <ColorField
        label="stroke color"
        color={iconParams.hair.strokeColor}
        fallbackColor={computeColors.hair.computedStrokeColor}
        setColor={(color) => setProps("hair", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          reset("hair", "strokeColor");
        }}
      />
    </>
  );
};

export default HairSettings;
