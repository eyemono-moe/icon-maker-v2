import type { Component } from "solid-js";
import { defaultPlainParams, useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { hairOptions } from "../parts/hair";

const HairSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

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
          setProps("hair", "baseColor", defaultPlainParams.hair.baseColor);
        }}
      />
      <ColorField
        label="highlight color"
        color={iconParams.hair.highlightColor}
        fallbackColor={iconParams.hair.computedHighlightColor}
        setColor={(color) => setProps("hair", "highlightColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "hair",
            "highlightColor",
            iconParams.hair.computedHighlightColor,
          );
        }}
      />
      <ColorField
        label="stroke color"
        color={iconParams.hair.strokeColor}
        fallbackColor={iconParams.hair.computedStrokeColor}
        setColor={(color) => setProps("hair", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          setProps("hair", "strokeColor", iconParams.hair.computedStrokeColor);
        }}
      />
    </>
  );
};

export default HairSettings;
