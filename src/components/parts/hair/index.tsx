import { type Component, Match, Switch, lazy } from "solid-js";
import { useIconParams } from "~/context/icon";

const Short = lazy(() => import("./Short"));

const Hair: Component = () => {
  const [iconParams] = useIconParams();
  return (
    <Switch fallback={<Short />}>
      <Match when={iconParams.hair.type === "short"}>
        <Short />
      </Match>
    </Switch>
  );
};

export default Hair;
