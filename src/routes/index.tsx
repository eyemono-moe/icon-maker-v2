import { Link, Meta, Title } from "@solidjs/meta";
import { getRequestEvent } from "solid-js/web";
import { object, optional, string } from "valibot";
import MainView from "~/components/MainView";
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
      <MainView />
    </>
  );
}
