import { renderToString } from "solid-js/web";
import { optimize } from "svgo";
import Icon from "~/components/Icon";
import { type IconParams, IconParamsProvider } from "~/context/icon";
import { SsrPortalProvider } from "~/context/ssrPortal";

export const ssrSvgStr = (params?: IconParams) => {
  const svgText = renderToString(() => (
    <SsrPortalProvider>
      <IconParamsProvider params={params}>
        <Icon />
      </IconParamsProvider>
    </SsrPortalProvider>
  ));

  const optimized = optimize(svgText, {
    plugins: [
      "removeComments",
      "removeUselessDefs",
      {
        name: "removeUnknownsAndDefaults",
        params: {
          keepDataAttrs: false,
        },
      },
    ],
  });
  return optimized.data;
};
