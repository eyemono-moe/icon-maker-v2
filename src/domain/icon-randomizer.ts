import { type Rng, choice, randomHSL } from "~/lib/random";
import { type IconState, iconStateSchema } from "./icon-state";

type RandomizableKey = Exclude<keyof IconState, "accessories">;

type Generator<T> = (rng: Rng) => T;

type ValueGenerators = {
  [K in RandomizableKey]: IconState[K] extends string
    ? Generator<IconState[K]>
    : { [P in keyof IconState[K]]-?: Generator<NonNullable<IconState[K][P]>> };
};

const entries = iconStateSchema.entries;

const anyColor: Generator<string> = (rng) =>
  randomHSL([0, 360], [0, 1], [0, 1], rng);

export const valueGenerators: ValueGenerators = {
  hair: {
    type: (rng) => choice(entries.hair.entries.type.options, rng),
    baseColor: (rng) => randomHSL([0, 360], [0, 1], [0.05, 1], rng),
    strokeColor: anyColor,
    highlightColor: anyColor,
  },
  eyes: {
    type: (rng) => choice(entries.eyes.entries.type.options, rng),
    pupilBaseColor: anyColor,
    pupilSecondaryColor: anyColor,
    eyeWhiteColor: anyColor,
    shadowColor: anyColor,
    eyelashesColor: anyColor,
  },
  eyebrows: {
    type: (rng) => choice(entries.eyebrows.entries.type.options, rng),
    baseColor: anyColor,
  },
  mouth: {
    type: (rng) => choice(entries.mouth.entries.type.options, rng),
    strokeColor: anyColor,
    teethColor: anyColor,
    insideColor: anyColor,
  },
  head: {
    type: () => "default",
    baseColor: (rng) => randomHSL([0, 25], [0.5, 1], [0.6, 0.9], rng),
    strokeColor: anyColor,
    shadowColor: anyColor,
  },
  background: (rng) => randomHSL([0, 360], [0.2, 1], [0.2, 0.9], rng),
};

const MAX_ATTEMPTS = 8;

/**
 * Generates a random value for a single field.
 * When `current` is given, retries a few times so the value visibly changes
 * (a field with a single option, such as `head.type`, keeps its value).
 */
export const randomFieldValue = <
  K1 extends RandomizableKey,
  K2 extends keyof IconState[K1],
>(
  key: K1,
  subKey: K2 | undefined,
  current?: unknown,
  rng: Rng = Math.random,
): unknown => {
  const generators = valueGenerators[key];
  const generate = (
    typeof generators === "function"
      ? generators
      : (generators as Record<K2, Generator<unknown>>)[subKey as K2]
  ) as Generator<unknown>;

  let value = generate(rng);
  for (let i = 1; i < MAX_ATTEMPTS && value === current; i++) {
    value = generate(rng);
  }
  return value;
};

/**
 * Builds a whole icon state from random part types and main colors.
 * Derived colors are left unset so they follow the main colors.
 */
export const createRandomIconState = (rng: Rng = Math.random): IconState => ({
  hair: {
    type: valueGenerators.hair.type(rng),
    baseColor: valueGenerators.hair.baseColor(rng),
  },
  eyes: {
    type: valueGenerators.eyes.type(rng),
    pupilBaseColor: valueGenerators.eyes.pupilBaseColor(rng),
  },
  eyebrows: { type: valueGenerators.eyebrows.type(rng) },
  mouth: { type: valueGenerators.mouth.type(rng) },
  accessories: [],
  head: {
    type: valueGenerators.head.type(rng),
    baseColor: valueGenerators.head.baseColor(rng),
  },
  background: valueGenerators.background(rng),
});
