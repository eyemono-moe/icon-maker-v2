import { Title } from "@solidjs/meta";
import Icon from "~/components/Icon";

export default function Home() {
  return (
    <main>
      <Title>eyemono.moe icon maker</Title>
      <div class="w-100vh">
        <Icon />
      </div>
    </main>
  );
}
