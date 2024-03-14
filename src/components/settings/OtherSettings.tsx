import type { Component } from "solid-js";
import { defaultParams, useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";

const OtherSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

  return (
    <>
      <ColorField
        label="background color"
        color={iconParams.background}
        setColor={(color) => setProps("background", color)}
        resetColor={() => {
          setProps("background", defaultParams.background);
        }}
      />
    </>
  );
};

export default OtherSettings;
