import type { Component } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import ColorField from "../UI/ColorField";
import PartsSelect from "../UI/PartsSelect";
import { eyebrowsOptions } from "../parts/eyebrows";
import { eyesOptions } from "../parts/eyes";

const EyesSettings: Component = () => {
  const [iconColors, { setColors, computeColors, reset }] = useIconColors();

  return (
    <>
      <PartsSelect
        options={eyebrowsOptions}
        label="eyebrow type"
        value={iconColors.eyebrows.type}
        onChange={(value) => {
          setColors("eyebrows", "type", value);
        }}
        previewViewBox="185 125 100 100"
        onReset={() => {
          reset("eyebrows", "type");
        }}
      />
      <ColorField
        label="eyebrow color"
        color={iconColors.eyebrows.baseColor}
        fallbackColor={computeColors.eyebrows.computedBaseColor}
        setColor={(color) => setColors("eyebrows", "baseColor", color)}
        canEmpty
        onReset={() => {
          reset("eyebrows", "baseColor");
        }}
      />
      <PartsSelect
        options={eyesOptions}
        label="eyes type"
        value={iconColors.eyes.type}
        onChange={(value) => {
          setColors("eyes", "type", value);
        }}
        previewViewBox="200 175 100 100"
        onReset={() => {
          reset("eyes", "type");
        }}
      />
      <ColorField
        label="pupil color 1"
        color={iconColors.eyes.pupilBaseColor}
        setColor={(color) => setColors("eyes", "pupilBaseColor", color)}
        onReset={() => {
          reset("eyes", "pupilBaseColor");
        }}
      />
      <ColorField
        label="pupil color 2"
        color={iconColors.eyes.pupilSecondaryColor}
        fallbackColor={computeColors.eyes.computedPupilSecondaryColor}
        setColor={(color) => setColors("eyes", "pupilSecondaryColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "pupilSecondaryColor");
        }}
      />
      <ColorField
        label="eyelashes color"
        color={iconColors.eyes.eyelashesColor}
        fallbackColor={computeColors.eyes.computedEyelashesColor}
        setColor={(color) => setColors("eyes", "eyelashesColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "eyelashesColor");
        }}
      />
      <ColorField
        label="eye white color"
        color={iconColors.eyes.eyeWhiteColor}
        fallbackColor={computeColors.eyes.computedEyeWhiteColor}
        setColor={(color) => setColors("eyes", "eyeWhiteColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "eyeWhiteColor");
        }}
      />
      <ColorField
        label="eye white shadow color"
        color={iconColors.eyes.shadowColor}
        fallbackColor={computeColors.eyes.computedShadowColor}
        setColor={(color) => setColors("eyes", "shadowColor", color)}
        canEmpty
        onReset={() => {
          reset("eyes", "shadowColor");
        }}
      />
    </>
  );
};

export default EyesSettings;
