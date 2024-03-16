// @refresh reload
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/svg+xml" href="/image?f=svg" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com/"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Noto Sans JP:wght@400;700&display=swap"
          />
          <title>eyemono.moe icon maker</title>
          <meta name="description" content="君だけのeyemono.moeを作り出せ！" />
          <meta property="og:url" content="https://icon.eyemono.moe" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="eyemono.moeメーカー" />
          <meta
            property="og:description"
            content="君だけのeyemono.moeを作り出せ！"
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="icon.eyemono.moe" />
          <meta property="twitter:url" content="https://icon.eyemono.moe" />
          <meta name="twitter:title" content="eyemono.moeメーカー" />
          <meta
            name="twitter:description"
            content="君だけのeyemono.moeを作り出せ！"
          />
          {assets}
        </head>
        <body>
          <div id="app" class="w-full h-100dvh font-sans">
            {children}
          </div>
          {scripts}
        </body>
      </html>
    )}
  />
));
