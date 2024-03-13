import type { Component } from "solid-js";
import { defaultParams, useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const HairSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

  return (
    <div>
      <ColorField
        label="base color"
        color={iconParams.hair.baseColor}
        setColor={(color) => setProps("hair", "baseColor", color)}
        resetColor={() => {
          setProps("hair", "baseColor", defaultParams.hair.baseColor);
        }}
      />
      <ColorField
        label="highlight color"
        color={
          iconParams.hair.highlightColor ??
          iconParams.hair.computedHighlightColor
        }
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
        color={
          iconParams.hair.strokeColor ?? iconParams.hair.computedStrokeColor
        }
        setColor={(color) => setProps("hair", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          setProps("hair", "strokeColor", iconParams.hair.computedStrokeColor);
        }}
      />
    </div>
  );
};

export default HairSettings;
