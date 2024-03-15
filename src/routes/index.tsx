import { Title } from "@solidjs/meta";
import Actions from "~/components/Actions";
import Icon from "~/components/Icon";
import Settings from "~/components/Settings";

export default function Home() {
  return (
    <>
      <Title>eyemono.moe icon maker</Title>
      <main class="h-full prose md:(text-base flex-row-reverse) mx-a text-sm prose-zinc max-w-1024px! flex flex-col px-2 pb-4 pt-2 gap-2">
        <div class="w-full md:h-full flex flex-col gap-4 justify-center items-center">
          <div class="w-full md:max-w-unset max-w-40vh children-[svg]:(w-full aspect-square h-auto)">
            <Icon />
          </div>
          <Actions />
        </div>
        <Settings />
      </main>
    </>
  );
}
