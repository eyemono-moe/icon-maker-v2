import { Field } from "@ark-ui/solid/field";
import { type Component, Show, createSignal, createUniqueId } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import {
  MAX_IDENTICON_SEED_LENGTH,
  identiconPath,
  isValidIdenticonSeed,
} from "~/domain/identicon";
import Button from "./Button";

const IdenticonField: Component = () => {
  const [_, { generateFromSeed }] = useIconColors();
  const inputId = createUniqueId();
  const [seed, setSeed] = createSignal("");

  const canGenerate = () => isValidIdenticonSeed(seed());

  return (
    <Field.Root class="flex flex-col gap-1 w-full">
      <Field.Label for={inputId} class="font-700 text-nowrap">
        generate from text
      </Field.Label>
      <form
        class="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (canGenerate()) void generateFromSeed(seed());
        }}
      >
        <Field.Input
          id={inputId}
          type="text"
          value={seed()}
          onInput={(e) => setSeed(e.currentTarget.value)}
          maxLength={MAX_IDENTICON_SEED_LENGTH}
          placeholder="email, username, ..."
          class="w-full h-8 px-2 b-1 rounded"
        />
        <Button variant="secondary" type="submit" disabled={!canGenerate()}>
          Generate
        </Button>
      </form>
      <Show when={canGenerate()}>
        <Field.HelperText class="text-xs c-zinc-600 break-all">
          API:{" "}
          <a
            class="underline"
            href={identiconPath(seed(), "svg")}
            target="_blank"
            rel="noreferrer"
          >
            {identiconPath(seed(), "svg")}
          </a>
        </Field.HelperText>
      </Show>
    </Field.Root>
  );
};

export default IdenticonField;
