import React from "react";
import {
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SimpleIcon } from "simple-icons";
import { C, F } from "../theme";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const useSpr = (at: number, damping = 200, durationInFrames?: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: f - at,
    fps,
    config: { damping, mass: 0.8 },
    durationInFrames,
  });
};

export const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {
    ...clamp,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

// Text that slides up out of a mask.
export const Reveal: React.FC<{
  at: number;
  children: React.ReactNode;
  out?: number; // frame to slide back out (upwards)
  style?: React.CSSProperties;
}> = ({ at, children, out, style }) => {
  const f = useCurrentFrame();
  const pin = useSpr(at, 200, 18);
  const pout = out === undefined ? 0 : ease(f, out, out + 12);
  const y = (1 - pin) * 105 - pout * 105;
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "top",
        paddingBottom: "0.14em",
        marginBottom: "-0.14em",
        ...style,
      }}
    >
      <span style={{ display: "inline-block", transform: `translateY(${y}%)` }}>
        {children}
      </span>
    </span>
  );
};

// Headline revealed word by word; words listed in `hl` get the brand colour.
export const Words: React.FC<{
  text: string;
  at: number;
  out?: number;
  hl?: string[];
  hlColor?: string;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, at, out, hl = [], hlColor = C.maroon, stagger = 3, style }) => {
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em", ...style }}>
      {words.map((w, i) => (
        <Reveal key={i} at={at + i * stagger} out={out}>
          <span style={{ color: hl.includes(w.replace(/[.,!?]/g, "")) ? hlColor : undefined }}>
            {w}
          </span>
        </Reveal>
      ))}
    </div>
  );
};

export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.maroon, style }) => (
  <div
    style={{
      fontFamily: F.display,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const BrandIcon: React.FC<{
  icon: SimpleIcon;
  size?: number;
  color?: string;
}> = ({ icon, size = 32, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d={icon.path} fill={color ?? `#${icon.hex}`} />
  </svg>
);

export type SfxName =
  | "pop"
  | "send"
  | "ding"
  | "whoosh"
  | "click"
  | "key"
  | "impact"
  | "powerdown"
  | "powerup"
  | "success";

export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({
  at,
  name,
  volume = 0.6,
}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={60} layout="none">
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

// Several keystrokes spread over a typing window.
export const TypingSfx: React.FC<{ from: number; to: number; every?: number; volume?: number }> = ({
  from,
  to,
  every = 3,
  volume = 0.35,
}) => {
  const hits: number[] = [];
  for (let t = from; t < to; t += every) hits.push(t);
  return (
    <>
      {hits.map((t) => (
        <Sfx key={t} at={t} name="key" volume={volume} />
      ))}
    </>
  );
};

export const typed = (text: string, f: number, start: number, cps = 1.2) =>
  text.slice(0, Math.max(0, Math.floor((f - start) * cps)));

export const Count: React.FC<{
  to: number;
  at: number;
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}> = ({ to, at, dur = 30, decimals = 0, prefix = "", suffix = "" }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [0, to], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <>
      {prefix}
      {v.toLocaleString("en", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
};

// The GLAM / MODA letter grid from the logo.
export const Wordmark: React.FC<{
  size: number;
  color?: string;
  at?: number;
  animate?: boolean;
}> = ({ size, color = C.white, at = 0, animate = true }) => {
  const rows = ["GLAM", "MODA"];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(4, ${size * 1.05}px)`,
        columnGap: size * 0.42,
        rowGap: size * 0.3,
        fontFamily: F.display,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1,
        color,
      }}
    >
      {rows.flatMap((r, ri) =>
        r.split("").map((ch, ci) => (
          <div key={`${ri}${ci}`} style={{ textAlign: "center" }}>
            {animate ? <Reveal at={at + (ri * 4 + ci) * 2}>{ch}</Reveal> : ch}
          </div>
        )),
      )}
    </div>
  );
};

// macOS-style pointer that glides between key points and ripples on click.
export type CursorKey = { f: number; x: number; y: number; click?: boolean };

export const Cursor: React.FC<{ keys: CursorKey[]; scale?: number }> = ({ keys, scale = 1 }) => {
  const f = useCurrentFrame();
  if (f < keys[0].f - 10) return null;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = ease(f, a.f, b.f);
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
    }
  }
  if (f > keys[keys.length - 1].f) {
    x = keys[keys.length - 1].x;
    y = keys[keys.length - 1].y;
  }
  const clicks = keys.filter((k) => k.click && f >= k.f && f < k.f + 14);
  const press = keys.some((k) => k.click && f >= k.f && f < k.f + 4);
  const appear = ease(f, keys[0].f - 10, keys[0].f);
  return (
    <>
      {clicks.map((k) => {
        const p = (f - k.f) / 14;
        return (
          <div
            key={k.f}
            style={{
              position: "absolute",
              left: k.x - 30 * scale,
              top: k.y - 30 * scale,
              width: 60 * scale,
              height: 60 * scale,
              borderRadius: "50%",
              border: `${3 * scale}px solid ${C.maroon}`,
              opacity: 1 - p,
              transform: `scale(${0.3 + p})`,
            }}
          />
        );
      })}
      <svg
        width={30 * scale}
        height={30 * scale}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x - 5 * scale,
          top: y - 3 * scale,
          opacity: appear,
          transform: `scale(${press ? 0.85 : 1})`,
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
        }}
      >
        <path
          d="M5 2.5 L5 19.5 L9.3 15.4 L12.1 21.6 L15 20.4 L12.3 14.3 L18.2 14.3 Z"
          fill={C.ink}
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

// Rotating caption block used beside the device mockups.
export type Caption = { from: number; eyebrow: string; text: string; hl?: string[] };

export const Captions: React.FC<{
  items: Caption[];
  size?: number;
  color?: string;
  eyebrowColor?: string;
  hlColor?: string;
  width?: number;
}> = ({ items, size = 76, color = C.ink, eyebrowColor = C.maroon, hlColor = C.maroon, width = 780 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", width, height: size * 4.6 }}>
      {items.map((c, i) => {
        const next = items[i + 1]?.from;
        if (f < c.from || (next !== undefined && f > next + 14)) return null;
        return (
          <div key={i} style={{ position: "absolute", inset: 0 }}>
            <Eyebrow color={eyebrowColor} style={{ marginBottom: 26 }}>
              <Reveal at={c.from} out={next}>
                {c.eyebrow}
              </Reveal>
            </Eyebrow>
            <Words
              text={c.text}
              at={c.from + 3}
              out={next}
              hl={c.hl}
              hlColor={hlColor}
              style={{
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color,
              }}
            />
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 0, left: 0, display: "flex", gap: 10 }}>
        {items.map((c, i) => {
          const next = items[i + 1]?.from ?? Infinity;
          const on = f >= c.from && f < next;
          return (
            <div
              key={i}
              style={{
                height: 6,
                width: on ? 46 : 14,
                borderRadius: 3,
                background: on ? hlColor : "rgba(128,128,128,0.35)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
