import * as v from "valibot";

const colorSchema = v.pipe(
  v.string(),
  v.maxLength(32),
  v.regex(
    /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i,
    "invalid color",
  ),
);

const accessorySchema = v.variant("type", [
  v.object({
    type: v.literal("glasses"),
    colors: v.tuple([colorSchema]),
  }),
  v.object({
    type: v.literal("blush"),
    colors: v.tuple([colorSchema]),
  }),
  v.object({
    type: v.literal("catEars"),
    colors: v.tuple([colorSchema, colorSchema]),
  }),
]);

export const iconStateSchema = v.object({
  hair: v.object({
    type: v.picklist(["short", "ponytail", "blunt", "bluntPonytail"]),
    baseColor: colorSchema,
    strokeColor: v.optional(colorSchema),
    highlightColor: v.optional(colorSchema),
  }),
  eyes: v.object({
    type: v.picklist([
      "default",
      "jito",
      "close",
      "small",
      "funky",
      "batsu",
      "guru",
      "hau",
    ]),
    pupilBaseColor: colorSchema,
    pupilSecondaryColor: v.optional(colorSchema),
    eyeWhiteColor: v.optional(colorSchema),
    shadowColor: v.optional(colorSchema),
    eyelashesColor: v.optional(colorSchema),
  }),
  eyebrows: v.object({
    type: v.picklist(["default", "komari", "angry"]),
    baseColor: v.optional(colorSchema),
  }),
  mouth: v.object({
    type: v.picklist([
      "default",
      "smile",
      "a",
      "e",
      "i",
      "o",
      "u",
      "gunya",
      "uwa",
      "atsui",
    ]),
    strokeColor: v.optional(colorSchema),
    teethColor: v.optional(colorSchema),
    insideColor: v.optional(colorSchema),
  }),
  accessories: v.array(accessorySchema),
  head: v.object({
    type: v.literal("default"),
    baseColor: colorSchema,
    strokeColor: v.optional(colorSchema),
    shadowColor: v.optional(colorSchema),
  }),
  background: colorSchema,
});

export type IconState = v.InferOutput<typeof iconStateSchema>;

const defaultIconState: IconState = {
  hair: {
    baseColor: "#9940BB",
    type: "short",
  },
  eyes: {
    pupilBaseColor: "#EE2266",
    type: "default",
  },
  accessories: [],
  background: "#BBEE66",
  eyebrows: {
    type: "default",
  },
  head: {
    type: "default",
    baseColor: "#FFCCCC",
  },
  mouth: {
    type: "default",
  },
};

export const createDefaultIconState = (): IconState =>
  JSON.parse(JSON.stringify(defaultIconState)) as IconState;
