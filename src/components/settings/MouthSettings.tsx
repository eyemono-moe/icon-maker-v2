import type { Component } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { mouthOptions } from "../parts/mouth";

const MouthSettings: Component = () => {
  const [iconColors, { setColors, computeColors, reset }] = useIconColors();

  return (
    <>
      <PartsSelect
        options={mouthOptions}
        label="mouth type"
        value={iconColors.mouth.type}
        onChange={(value) => {
          setColors("mouth", "type", value);
        }}
        previewViewBox="188 282 60 60"
        onReset={() => {
          reset("mouth", "type");
        }}
      />
      <ColorField
        label="line color"
        color={iconColors.mouth.strokeColor}
        fallbackColor={computeColors.mouth.computedStrokeColor}
        setColor={(color) => setColors("mouth", "strokeColor", color)}
        canEmpty
        onReset={() => {
          reset("mouth", "strokeColor");
        }}
      />
      <ColorField
        label="inside color"
        color={iconColors.mouth.insideColor}
        fallbackColor={computeColors.mouth.computedInsideColor}
        setColor={(color) => setColors("mouth", "insideColor", color)}
        canEmpty
        onReset={() => {
          reset("mouth", "insideColor");
        }}
      />
      <ColorField
        label="teeth color"
        color={iconColors.mouth.teethColor}
        fallbackColor={computeColors.mouth.computedTeethColor}
        setColor={(color) => setColors("mouth", "teethColor", color)}
        canEmpty
        onReset={() => {
          reset("mouth", "teethColor");
        }}
      />
    </>
  );
};

export default MouthSettings;
