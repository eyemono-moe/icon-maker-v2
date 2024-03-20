import type { Component } from "solid-js";
import Actions from "./Actions";

const Header: Component = () => {
  return (
    <header class="w-full bg-zinc-200 px-2 py-1">
      <div class="flex justify-between items-center">
        <div>
          <Actions />
        </div>
        <h1 class="not-prose font-700 text-lg">eyemono.svg</h1>
        <a
          href="https://github.com/eyemono-moe/icon-maker-v2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
        >
          <div class="i-ri:github-fill h-6 w-6" />
        </a>
      </div>
    </header>
  );
};

export default Header;
