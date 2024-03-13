import { Title } from "@solidjs/meta";
import Icon from "~/components/Icon";
import Settings from "~/components/Settings";

export default function Home() {
  return (
    <main>
      <Title>eyemono.moe icon maker</Title>
      <div class="flex">
        <Settings />
        <div class="w-full">
          <Icon />
        </div>
      </div>
    </main>
  );
}
