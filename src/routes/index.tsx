import { Link, Meta, Title } from "@solidjs/meta";
import { Show, getRequestEvent } from "solid-js/web";
import { object, optional, string } from "valibot";
import Actions from "~/components/Actions";
import Icon from "~/components/Icon";
import Settings from "~/components/Settings";
import { useQuery } from "~/lib/query";

const querySchema = object({
  p: optional(string()),
});

const getParamsServer = () => {
  "use server";
  const event = getRequestEvent();
  if (event) {
    const query = useQuery(querySchema, event.nativeEvent);
    return query.p;
  }
};

export default function Home() {
  const serverIconParam = getParamsServer();

  return (
    <>
      <Title>eyemono.moe icon maker</Title>
      <Show when={serverIconParam}>
        <Meta
          property="og:image"
          content={`https://icon.eyemono.moe/ogp?p=${serverIconParam}`}
        />
        <Meta
          property="twitter:image"
          content={`https://icon.eyemono.moe/ogp?p=${serverIconParam}`}
        />
        <Link
          rel="icon"
          type="image/svg+xml"
          href={`/image?p=${serverIconParam}&f=svg`}
        />
      </Show>
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
