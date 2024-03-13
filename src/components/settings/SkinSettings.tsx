import type { Component } from "solid-js";
import { defaultParams, useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const SkinSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

  return (
    <div>
      <ColorField
        label="skin color"
        color={iconParams.head.baseColor}
        setColor={(color) => setProps("head", "baseColor", color)}
        resetColor={() => {
          setProps("head", "baseColor", defaultParams.head.baseColor);
        }}
      />
      <ColorField
        label="shadow color"
        color={
          iconParams.head.shadowColor ?? iconParams.head.computedShadowColor
        }
        setColor={(color) => setProps("head", "shadowColor", color)}
        canEmpty
        resetColor={() => {
          setProps("head", "shadowColor", iconParams.head.computedShadowColor);
        }}
      />
      <ColorField
        label="line color"
        color={
          iconParams.head.strokeColor ?? iconParams.head.computedStrokeColor
        }
        setColor={(color) => setProps("head", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          setProps("head", "strokeColor", iconParams.head.computedStrokeColor);
        }}
      />
    </div>
  );
};

export default SkinSettings;
