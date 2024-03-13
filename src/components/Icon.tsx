import type { Component } from "solid-js";
import Background from "./parts/background";
import Eyebrows from "./parts/eyebrows";
import Eyes from "./parts/eyes";
import Hair from "./parts/hair";
import Head from "./parts/head";
import Mouth from "./parts/mouth";

const Icon: Component = () => {
  return (
    <>
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        class="w-full aspect-square h-auto"
      >
        <title>eyemono.moe icon</title>
        <g id="background-target" />
        <g id="accessory-bottom-target" />
        <g id="hair-back-target" />
        <g id="neck-target" />
        <g id="head-target" />
        <g id="accessory-skin-target" />
        <g id="hair-shadow-target" />
        <g id="eye-lower-target" />
        <g id="hair-front-target" />
        <g id="eye-upper-target" />
        <g id="mouth-target" />
        <g id="eyebrow-target" />
        <g id="accessory-top-target" />
        <Background />
        <Eyebrows />
        <Eyes />
        <Hair />
        <Head />
        <Mouth />
      </svg>
    </>
  );
};

export default Icon;
