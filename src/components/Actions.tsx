import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import Button from "./UI/Button";

const Actions: Component = () => {
  const [_, { saveToUrl, loadFromUrl }] = useIconParams();

  return (
    <div class="flex gap-2">
      <Button onClick={saveToUrl} type="button">
        Share
      </Button>
    </div>
  );
};

export default Actions;
