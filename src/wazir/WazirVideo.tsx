import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { C } from "../theme";
import { T, Timeline, Shot } from "../ui/timeline";
import { TEAM } from "./agents";
import { DhawwaqCard, FahesCard, HafezCard, KashefCard, NaseejCard, RaedCard, RasidCard, TajerCard } from "./cards";
import { ColdOpen, DashboardShot, Governance, KillSwitch, OrgChart, Slam, Spotlight, TelegramShot, WazirOutro } from "./scenes";

// Absolute shot starts on the 120 BPM grid (60 frames = 1 bar). The music drops at 120,
// powers down at 1710 (kill switch) and comes back at 1800.
export const W = {
  cold: 0,
  slam: 120,
  org: 240,
  spot: 420, // 8 x 75
  telegram: 1020,
  dashboard: 1230,
  governance: 1590,
  kill: 1680,
  outro: 1800,
  total: 1920,
};

const CARDS = [NaseejCard, HafezCard, RaedCard, KashefCard, FahesCard, DhawwaqCard, TajerCard, RasidCard];
const SPOT_IN = [T.left, T.up, T.wipeL, T.left, T.up, T.wipeL, T.left, T.up];

export const WazirVideo: React.FC = () => {
  const spots: Shot[] = TEAM.map((a, i) => {
    const CardEl = CARDS[i];
    return {
      start: W.spot + i * 75,
      enter: i === 0 ? T.wipeUp : SPOT_IN[i],
      node: (
        <Spotlight agent={a} n={i + 1} dark={i % 2 === 1}>
          <CardEl />
        </Spotlight>
      ),
    };
  });
  return (
    <AbsoluteFill style={{ background: C.maroon }}>
      <Audio src={staticFile("audio/music-wazir.wav")} volume={0.6} />
      <Timeline
        total={W.total}
        shots={[
          { start: W.cold, node: <ColdOpen /> },
          { start: W.slam, enter: T.wipeUp, node: <Slam />, whoosh: false },
          { start: W.org, enter: T.up, node: <OrgChart /> },
          ...spots,
          { start: W.telegram, enter: T.wipeL, node: <TelegramShot /> },
          { start: W.dashboard, enter: T.up, node: <DashboardShot /> },
          { start: W.governance, enter: T.left, node: <Governance /> },
          { start: W.kill, enter: T.fade, node: <KillSwitch />, whoosh: false },
          { start: W.outro, enter: T.wipeUp, node: <WazirOutro />, whoosh: false },
        ]}
      />
    </AbsoluteFill>
  );
};
