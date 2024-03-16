import { Link, Meta, Title } from "@solidjs/meta";
import { Show, getRequestEvent } from "solid-js/web";
import { object, optional, string } from "valibot";
import Actions from "~/components/Actions";
import Header from "~/components/Header";
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
      <div class="grid grid-rows-[auto_1fr] w-full h-full prose prose-zinc max-w-unset!">
        <Header />
        <main class="h-full w-full md:(text-base flex-row-reverse items-stretch) mx-a text-sm items-center max-w-1024px! flex flex-col px-2 pb-4 pt-2 gap-2 overflow-hidden">
          <div class="flex flex-col justify-center w-full md:max-w-unset max-w-25vh">
            <div class="flex flex-col rounded overflow-hidden">
              <div class="bg-zinc-200">
                <div class="text-center c-zinc-500">eyemono.svg</div>
                <Actions />
              </div>
              <div class="children-[svg]:(w-full aspect-square h-auto)">
                <Icon />
              </div>
            </div>
          </div>
          <Settings />
        </main>
      </div>
    </>
  );
}
