import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { mouthOptions } from "../parts/mouth";

const MouthSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

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
      />
      <ColorField
        label="line color"
        color={iconParams.mouth.strokeColor}
        fallbackColor={iconParams.mouth.computedStrokeColor}
        setColor={(color) => setProps("mouth", "strokeColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "mouth",
            "strokeColor",
            iconParams.mouth.computedStrokeColor,
          );
        }}
      />
      <ColorField
        label="inside color"
        color={iconParams.mouth.insideColor}
        fallbackColor={iconParams.mouth.computedInsideColor}
        setColor={(color) => setProps("mouth", "insideColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "mouth",
            "insideColor",
            iconParams.mouth.computedInsideColor,
          );
        }}
      />
      <ColorField
        label="teeth color"
        color={iconParams.mouth.teethColor}
        fallbackColor={iconParams.mouth.computedTeethColor}
        setColor={(color) => setProps("mouth", "teethColor", color)}
        canEmpty
        resetColor={() => {
          setProps("mouth", "teethColor", iconParams.mouth.computedTeethColor);
        }}
      />
    </>
  );
};

export default MouthSettings;
