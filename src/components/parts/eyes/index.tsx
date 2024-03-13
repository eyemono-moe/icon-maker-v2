import { type Component, Match, Switch, lazy } from "solid-js";
import { useIconParams } from "~/context/icon";

const Default = lazy(() => import("./Default"));

const Eyes: Component = () => {
  const [iconParams] = useIconParams();
  return (
    <Switch>
      <Match when={iconParams.eyes.type === "default"}>
        <Default />
      </Match>
    </Switch>
  );
};

export default Eyes;
