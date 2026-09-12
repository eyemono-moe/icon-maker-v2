import type { Component, JSX } from "solid-js";
import Background from "~/components/parts/background";
import Angry from "~/components/parts/eyebrows/Angry";
import DefaultEyebrows from "~/components/parts/eyebrows/Default";
import Komari from "~/components/parts/eyebrows/Komari";
import Batsu from "~/components/parts/eyes/Batsu";
import Close from "~/components/parts/eyes/Close";
import DefaultEyes from "~/components/parts/eyes/Default";
import Funky from "~/components/parts/eyes/Funky";
import Guru from "~/components/parts/eyes/Guru";
import Hau from "~/components/parts/eyes/Hau";
import Jito from "~/components/parts/eyes/Jito";
import Small from "~/components/parts/eyes/Small";
import Blunt from "~/components/parts/hair/Blunt";
import BluntPonytail from "~/components/parts/hair/BluntPonytail";
import Ponytail from "~/components/parts/hair/Ponytail";
import Short from "~/components/parts/hair/Short";
import DefaultHead from "~/components/parts/head/Default";
import A from "~/components/parts/mouth/A";
import Atsui from "~/components/parts/mouth/Atsui";
import DefaultMouth from "~/components/parts/mouth/Default";
import E from "~/components/parts/mouth/E";
import Gunya from "~/components/parts/mouth/Gunya";
import I from "~/components/parts/mouth/I";
import O from "~/components/parts/mouth/O";
import Smile from "~/components/parts/mouth/Smile";
import U from "~/components/parts/mouth/U";
import Uwa from "~/components/parts/mouth/Uwa";
import { useIconColors } from "~/context/iconColors";
import { useIconTransforms } from "~/context/iconTransforms";
import { PortalTarget } from "~/context/ssrPortal";

const iconSvgId = "icon-svg";

const ServerIcon: Component = () => {
  const [iconColors] = useIconColors();
  const [transform] = useIconTransforms();

  const renderPart = (
    type: string,
    components: Record<string, Component>,
  ): JSX.Element => {
    const Part = components[type];
    return Part ? <Part /> : null;
  };

  return (
    <svg
      viewBox="0 0 400 400"
      width="400"
      height="400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      id={iconSvgId}
      class="overflow-visible"
    >
      <title>eyemono.moe icon</title>
      <Background />
      {renderPart(iconColors.eyebrows.type, {
        default: DefaultEyebrows,
        komari: Komari,
        angry: Angry,
      })}
      {renderPart(iconColors.eyes.type, {
        default: DefaultEyes,
        jito: Jito,
        close: Close,
        small: Small,
        funky: Funky,
        batsu: Batsu,
        guru: Guru,
        hau: Hau,
      })}
      {renderPart(iconColors.hair.type, {
        short: Short,
        ponytail: Ponytail,
        blunt: Blunt,
        bluntPonytail: BluntPonytail,
      })}
      {renderPart(iconColors.head.type, { default: DefaultHead })}
      {renderPart(iconColors.mouth.type, {
        default: DefaultMouth,
        smile: Smile,
        a: A,
        e: E,
        i: I,
        o: O,
        u: U,
        gunya: Gunya,
        uwa: Uwa,
        atsui: Atsui,
      })}
      <PortalTarget id="background-target" />
      <g
        id="head-translate"
        transform={`translate(${transform.rawTransform.head.position.x * 10},${-transform.rawTransform.head.position.y * 10})`}
      >
        <PortalTarget id="accessory-bottom-target" />
        <g
          id="neck-rotation-for-hair-back"
          transform={`rotate(${transform.rawTransform.head.rotation / 2}, 255, 365)`}
        >
          <g
            id="head-rotation-for-hair-back"
            transform={`rotate(${transform.rawTransform.head.rotation / 2}, 230, 310)`}
          >
            <PortalTarget id="hair-back-target" />
          </g>
        </g>
        <g
          id="neck-rotation"
          transform={`rotate(${transform.rawTransform.head.rotation / 2}, 255, 365)`}
        >
          <PortalTarget id="neck-target" />
          <g
            id="head-rotation"
            transform={`rotate(${transform.rawTransform.head.rotation / 2}, 230, 310)`}
          >
            <PortalTarget id="head-target" />
            <PortalTarget id="accessory-skin-target" />
            <PortalTarget id="hair-shadow-target" />
            <PortalTarget id="nose-target" />
            <PortalTarget id="eye-lower-target" />
            <PortalTarget id="hair-front-target" />
            <PortalTarget id="eye-upper-target" />
            <PortalTarget id="mouth-target" />
            <PortalTarget id="eyebrow-target" />
            <PortalTarget id="accessory-top-target" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default ServerIcon;
