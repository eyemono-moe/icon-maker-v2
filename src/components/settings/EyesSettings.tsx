import type { Component } from "solid-js";
import { defaultParams, useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { eyebrowsOptions } from "../parts/eyebrows";
import { eyesOptions } from "../parts/eyes";

const EyesSettings: Component = () => {
  const [iconParams, { setProps }] = useIconParams();

  return (
    <div>
      <PartsSelect<"eyebrows">
        options={eyebrowsOptions}
        label="eyebrow type"
        value={iconParams.eyebrows.type}
        onChange={(value) => {
          setProps("eyebrows", "type", value);
        }}
        previewViewBox="185 125 100 100"
      />
      <ColorField
        label="eyebrow color"
        color={iconParams.eyebrows.baseColor}
        fallbackColor={iconParams.eyebrows.computedBaseColor}
        setColor={(color) => setProps("eyebrows", "baseColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "eyebrows",
            "baseColor",
            iconParams.eyebrows.computedBaseColor,
          );
        }}
      />
      <PartsSelect<"eyes">
        options={eyesOptions}
        label="eyes type"
        value={iconParams.eyes.type}
        onChange={(value) => {
          setProps("eyes", "type", value);
        }}
        previewViewBox="200 175 100 100"
      />
      <ColorField
        label="pupil color 1"
        color={iconParams.eyes.pupilBaseColor}
        setColor={(color) => setProps("eyes", "pupilBaseColor", color)}
        resetColor={() => {
          setProps("eyes", "pupilBaseColor", defaultParams.eyes.pupilBaseColor);
        }}
      />
      <ColorField
        label="pupil color 2"
        color={iconParams.eyes.pupilSecondaryColor}
        fallbackColor={iconParams.eyes.computedPupilSecondaryColor}
        setColor={(color) => setProps("eyes", "pupilSecondaryColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "eyes",
            "pupilSecondaryColor",
            iconParams.eyes.computedPupilSecondaryColor,
          );
        }}
      />
      <ColorField
        label="eyelashes color"
        color={iconParams.eyes.eyelashesColor}
        fallbackColor={iconParams.eyes.computedEyelashesColor}
        setColor={(color) => setProps("eyes", "eyelashesColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "eyes",
            "eyelashesColor",
            iconParams.eyes.computedEyelashesColor,
          );
        }}
      />
      <ColorField
        label="eye white color"
        color={iconParams.eyes.eyeWhiteColor}
        fallbackColor={iconParams.eyes.computedEyeWhiteColor}
        setColor={(color) => setProps("eyes", "eyeWhiteColor", color)}
        canEmpty
        resetColor={() => {
          setProps(
            "eyes",
            "eyeWhiteColor",
            iconParams.eyes.computedEyeWhiteColor,
          );
        }}
      />
      <ColorField
        label="eye white shadow color"
        color={iconParams.eyes.shadowColor}
        fallbackColor={iconParams.eyes.computedShadowColor}
        setColor={(color) => setProps("eyes", "shadowColor", color)}
        canEmpty
        resetColor={() => {
          setProps("eyes", "shadowColor", iconParams.eyes.computedShadowColor);
        }}
      />
    </div>
  );
};

export default EyesSettings;
