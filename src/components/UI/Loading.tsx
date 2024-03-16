import type { Component } from "solid-js";

const Loading: Component = () => {
  return (
    <div class="w-full h-full min-h-0 grid place-items-center">
      <div class="w-12 h-12 b-4 b-purple-600 b-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default Loading;
