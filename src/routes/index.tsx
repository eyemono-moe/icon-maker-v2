import { Title } from "@solidjs/meta";
import Icon from "~/components/Icon";
import Settings from "~/components/Settings";
import { useIconParams } from "~/context/icon";

export default function Home() {
  const [state, { saveToUrl, loadFromUrl }] = useIconParams();

  return (
    <main>
      <Title>eyemono.moe icon maker</Title>
      <div class="flex">
        <Settings />
        <div class="w-full">
          <Icon />
        </div>
        <div class="fixed bottom-0 right-0 m-4 flex gap-2">
          <button
            class="rounded p-2 bg-purple text-white"
            onClick={saveToUrl}
            type="button"
          >
            Save
          </button>
          <button
            class="rounded p-2 bg-purple text-white"
            onClick={loadFromUrl}
            type="button"
          >
            Load
          </button>
        </div>
      </div>
    </main>
  );
}
