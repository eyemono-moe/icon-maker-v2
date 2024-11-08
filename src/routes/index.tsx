import { Link, Meta, Title } from "@solidjs/meta";
import { getRequestEvent } from "solid-js/web";
import * as v from "valibot";
import MainView from "~/components/MainView";
import { useQuery } from "~/lib/query";

const querySchema = v.object({
  p: v.optional(v.string()),
});

const getParamsServer = () => {
  "use server";
  const event = getRequestEvent();
  if (event) {
    const query = useQuery(querySchema, event.nativeEvent);
    if (!query.success) {
      return undefined;
    }
    return query.output.p;
  }
};

export default function Home() {
  const serverIconParam = getParamsServer();
  const ogpParams = new URLSearchParams(
    serverIconParam ? { p: serverIconParam } : undefined,
  );
  const ogpUrl = `https://icon.eyemono.moe/ogp?${ogpParams.toString()}`;
  const iconParams = new URLSearchParams(
    serverIconParam ? { p: serverIconParam } : undefined,
  );
  const iconUrl = `/image?f=svg&${iconParams.toString()}`;

  return (
    <>
      <Title>eyemono.moe icon maker</Title>
      <Meta property="og:image" content={ogpUrl} />
      <Meta property="twitter:image" content={ogpUrl} />
      <Link rel="icon" type="image/svg+xml" href={iconUrl} />
      <div class="w-screen h-100dvh font-sans">
        <MainView />
      </div>
    </>
  );
}
