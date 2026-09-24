import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Sfx } from "./core";
import { TR } from "../theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pres = TransitionPresentation<any>;

export const T = {
  up: slide({ direction: "from-bottom" }) as Pres,
  left: slide({ direction: "from-right" }) as Pres,
  right: slide({ direction: "from-left" }) as Pres,
  down: slide({ direction: "from-top" }) as Pres,
  wipeL: wipe({ direction: "from-right" }) as Pres,
  wipeR: wipe({ direction: "from-left" }) as Pres,
  wipeUp: wipe({ direction: "from-bottom" }) as Pres,
  fade: fade() as Pres,
};

export type Shot = {
  start: number; // absolute frame where this shot starts (its transition begins here)
  node: React.ReactNode;
  enter?: Pres; // transition used to come in (ignored for the first shot)
  whoosh?: boolean;
};

// Shots are placed on absolute frames so every cut lands on the beat grid.
export const Timeline: React.FC<{ shots: Shot[]; total: number; tr?: number }> = ({
  shots,
  total,
  tr = TR,
}) => {
  const timing = linearTiming({
    durationInFrames: tr,
    easing: Easing.bezier(0.7, 0, 0.3, 1),
  });
  return (
    <>
      <TransitionSeries>
        {shots.map((s, i) => {
          const next = shots[i + 1];
          const dur = next ? next.start - s.start + tr : total - s.start;
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <TransitionSeries.Transition presentation={s.enter ?? T.left} timing={timing} />
              ) : null}
              <TransitionSeries.Sequence durationInFrames={dur}>
                <AbsoluteFill>{s.node}</AbsoluteFill>
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      {shots.slice(1).map((s) =>
        s.whoosh === false ? null : <Sfx key={s.start} at={s.start - 3} name="whoosh" volume={0.45} />,
      )}
    </>
  );
};
