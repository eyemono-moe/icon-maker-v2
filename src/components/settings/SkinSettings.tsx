import type { Component } from "solid-js";
import { defaultPlainParams, useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const SkinSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

  return (
    <>
      <ColorField
        label="skin color"
        color={iconParams.head.baseColor}
        setColor={(color) => setProps("head", "baseColor", color)}
        resetColor={() => {
          setProps("head", "baseColor", defaultPlainParams.head.baseColor);
        }}
      />
      <ColorField
        label="shadow color"
        color={iconParams.head.shadowColor}
        fallbackColor={iconParams.head.computedShadowColor}
        setColor={(color) => setProps("head", "shadowColor", color)}
        canEmpty
        resetColor={() => {
          setProps("head", "shadowColor", iconParams.head.computedShadowColor);
        }}
      />
      <ColorField
        label="line color"
        color={iconParams.head.strokeColor}
        fallbackColor={iconParams.head.computedStrokeColor}
        setColor={(color) => setProps("head", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          setProps("head", "strokeColor", iconParams.head.computedStrokeColor);
        }}
      />
    </>
  );
};

export default SkinSettings;
