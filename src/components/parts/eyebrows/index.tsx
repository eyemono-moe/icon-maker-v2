import { type Component, Match, Switch, lazy } from "solid-js";
import { useIconParams } from "~/context/icon";

const Default = lazy(() => import("./Default"));

const Eyebrows: Component = () => {
  const [iconParams] = useIconParams();
  return (
    <Switch>
      <Match when={iconParams.eyebrows.type === "default"}>
        <Default />
      </Match>
    </Switch>
  );
};

export default Eyebrows;
