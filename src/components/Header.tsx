import type { Component } from "solid-js";

const Header: Component = () => {
  return (
    <header class="w-full bg-zinc-200 p-2">
      <div class="mx-a max-w-1024px flex justify-between items-center">
        <h1 class="not-prose font-700 text-lg">eyemono.moe icon maker</h1>
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
