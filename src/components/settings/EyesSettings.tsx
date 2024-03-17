import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { eyebrowsOptions } from "../parts/eyebrows";
import { eyesOptions } from "../parts/eyes";

const EyesSettings: Component = () => {
  const [iconParams, { setProps, computeColors, reset }] = useIconParams();

  return (
    <>
      <PartsSelect
        options={eyebrowsOptions}
        label="eyebrow type"
        value={iconParams.eyebrows.type}
        onChange={(value) => {
          setProps("eyebrows", "type", value);
        }}
        previewViewBox="185 125 100 100"
        onReset={() => {
          reset("eyebrows", "type");
        }}
      />
      <ColorField
        label="eyebrow color"
        color={iconParams.eyebrows.baseColor}
        fallbackColor={computeColors.eyebrows.computedBaseColor}
        setColor={(color) => setProps("eyebrows", "baseColor", color)}
        canEmpty
        onReset={() => {
          reset("eyebrows", "baseColor");
        }}
      />
      <PartsSelect
        options={eyesOptions}
        label="eyes type"
        value={iconParams.eyes.type}
        onChange={(value) => {
          setProps("eyes", "type", value);
        }}
        previewViewBox="200 175 100 100"
        onReset={() => {
          reset("eyes", "type");
        }}
      />
      <ColorField
        label="pupil color 1"
        color={iconParams.eyes.pupilBaseColor}
        setColor={(color) => setProps("eyes", "pupilBaseColor", color)}
        onReset={() => {
          reset("eyes", "pupilBaseColor");
        }}
      />
      <ColorField
        label="pupil color 2"
        color={iconParams.eyes.pupilSecondaryColor}
        fallbackColor={computeColors.eyes.computedPupilSecondaryColor}
        setColor={(color) => setProps("eyes", "pupilSecondaryColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "pupilSecondaryColor");
        }}
      />
      <ColorField
        label="eyelashes color"
        color={iconParams.eyes.eyelashesColor}
        fallbackColor={computeColors.eyes.computedEyelashesColor}
        setColor={(color) => setProps("eyes", "eyelashesColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "eyelashesColor");
        }}
      />
      <ColorField
        label="eye white color"
        color={iconParams.eyes.eyeWhiteColor}
        fallbackColor={computeColors.eyes.computedEyeWhiteColor}
        setColor={(color) => setProps("eyes", "eyeWhiteColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "eyeWhiteColor");
        }}
      />
      <ColorField
        label="eye white shadow color"
        color={iconParams.eyes.shadowColor}
        fallbackColor={computeColors.eyes.computedShadowColor}
        setColor={(color) => setProps("eyes", "shadowColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "shadowColor");
        }}
      />
    </>
  );
};

export default EyesSettings;
