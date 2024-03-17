import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { mouthOptions } from "../parts/mouth";

const MouthSettings: Component = () => {
  const [iconParams, { setProps, computeColors, reset }] = useIconParams();

  return (
    <>
      <PartsSelect
        options={mouthOptions}
        label="mouth type"
        value={iconParams.mouth.type}
        onChange={(value) => {
          setProps("mouth", "type", value);
        }}
        previewViewBox="188 282 60 60"
        onReset={() => {
          reset("mouth", "type");
        }}
      />
      <ColorField
        label="line color"
        color={iconParams.mouth.strokeColor}
        fallbackColor={computeColors.mouth.computedStrokeColor}
        setColor={(color) => setProps("mouth", "strokeColor", color)}
        canEmpty
        onReset={() => {
          reset("mouth", "strokeColor");
        }}
      />
      <ColorField
        label="inside color"
        color={iconParams.mouth.insideColor}
        fallbackColor={computeColors.mouth.computedInsideColor}
        setColor={(color) => setProps("mouth", "insideColor", color)}
        canEmpty
        onReset={() => {
          reset("mouth", "insideColor");
        }}
      />
      <ColorField
        label="teeth color"
        color={iconParams.mouth.teethColor}
        fallbackColor={computeColors.mouth.computedTeethColor}
        setColor={(color) => setProps("mouth", "teethColor", color)}
        canEmpty
        onReset={() => {
          reset("mouth", "teethColor");
        }}
      />
    </>
  );
};

export default MouthSettings;
