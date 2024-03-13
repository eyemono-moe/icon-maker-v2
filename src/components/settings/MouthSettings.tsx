import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const MouthSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

  return (
    <div>
      <ColorField
        label="line color"
        color={
          iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
        }
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
        color={
          iconParams.mouth.insideColor ?? iconParams.mouth.computedInsideColor
        }
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
        color={
          iconParams.mouth.teethColor ?? iconParams.mouth.computedTeethColor
        }
        setColor={(color) => setProps("mouth", "teethColor", color)}
        canEmpty
        resetColor={() => {
          setProps("mouth", "teethColor", iconParams.mouth.computedTeethColor);
        }}
      />
    </div>
  );
};

export default MouthSettings;
